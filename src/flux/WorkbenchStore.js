var immutable = require('immutable');
var merge = require('react/lib/merge');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore = require('./RepositoryStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var data = immutable.Map({
	items: immutable.Vector()
});
var undoStack = [];
var redoStack = [];

/**
 * Modify the data object
 */
function setData(newData) {
	// Push the current state to the undo stack and clear the redo stack
	undoStack.push(data);
	redoStack = [];

	// Change the data object
	data = newData;
	WorkbenchStore.emitChange();
}

// function delete() {
// }

/**
 * Undo the previous action
 */
function undo() {
	if (undoStack.length === 0) {
		return;
	}
	redoStack.push(data);

	// Change the data object
	data = undoStack.pop();
	WorkbenchStore.emitChange();
}

/**
 * Redo the following action
 */
function redo() {
	if (redoStack.length === 0) {
		return;
	}
	undoStack.push(data);

	// Change the data object
	data = redoStack.pop();
	WorkbenchStore.emitChange();
}

/**
 * WorkbenchStore single object
 * (like a singleton)
 */
var WorkbenchStore = BaseStore.createStore({
	/**
	 * returns an immutable.Vector
	 */
	getAllItems() {
		return data.get('items');
	},
	/**
	 * returns an immutable.Map
	 */
	getItem(id) {
		return data.getIn(['items', id]);
	},
	/**
	 * returns an immutable.Set
	 */
	getItemsCoveredBy(rect) {
		return data.get('items')
			.toMap()
			.filter(f => rect.intersectsRect(f.get('rect')))
			.keySeq()
			.toSet();
	},
	/**
	 * returns a number
	 */
	getLastIndex() {
		return data.get('items').length - 1;
	},
	/**
	 * returns an immutable.Map
	 */
	getItemParameters(id) {
		return data.getIn(['items', id, 'parameter']);
	},
	/**
	 * returns an ImmutableRect
	 */
	getItemPosition(id) {
		return data.getIn(['items', id, 'rect']);
	},
	/**
	 * returns a boolean
	 */
	hasUndoSteps() {
		return undoStack.length !== 0;
	},
	/**
	 * returns a boolean
	 */
	hasRedoSteps() {
		return redoStack.length !== 0;
	}
});

WorkbenchStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.CREATE_ITEM:
			if (action.type === constants.ITEM_TYPE_FILTER) {
				addFilter(action.id, action.x, action.y);
			} else if (action.type === constants.ITEM_TYPE_PIPE) {
				addPipe(action.id, action.x, action.y);
			} else {
				throw new Error('Invalid type');
			}
		break;

		case constants.MOVE_SELECTED_ITEMS_BY:
			// item.get('type') === constants.ITEM_TYPE_FILTER
			// TODO: improve the updating
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta));
				});
			}));
			// TODO: redraw wires?
		break;

		case constants.DELETE_SELECTED_ITEMS:
			if (action.selectedItems.length === 0) {
				break;
			}
			// TODO: make sure that all IDs are still the same when deleting items in the middle
			// TODO: should they be set to undefined instead of deleted?
			// TODO: remove other filter's connection references
			var connectionDeleteList = immutable.Set().asMutable();
			setData(data.withMutations(data => {
				// Delete items
				data.updateIn(['items'], items => {
					action.selectedItems.forEach(itemId => {
						// Collect connections to delete
						connectionDeleteList.union(data.getIn(['items', itemId, 'connections']));
						// Delete item
						items = items.remove(itemId);
					});
					return items;
				});

				// Delete connections
				data.updateIn(['connections'], cns => {
					connectionDeleteList.forEach(cnId => {
						cns = cns.remove(cnId);
					});
					return cns;
				});
			}));
		break;

		case constants.UNDO:
			undo();
		break;

		case constants.REDO:
			redo();
		break;
	}
});

module.exports = WorkbenchStore;










/*************************************************************************
 * Item adding
 *************************************************************************/

function addFilter(name, x, y, params) {
	var baseFilter = RepositoryStore.getFilter(name);
	if (!baseFilter) {
		throw new Error('The filter class doesn\'t exist');
	}

	var inputs = baseFilter.inputs;
	var outputs = baseFilter.outputs;
	var parameter = merge(baseFilter.parameter, params);

	var item = immutable.Map({
		type: constants.ITEM_TYPE_FILTER,
		class: name,
		inputs: immutable.Vector.from(new Array(inputs)),
		outputs: immutable.Vector.from(new Array(outputs)),
		parameter: immutable.Map(parameter),
		rect: WorkbenchLayout.getFilterFrame(x, y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addPipe(name, x, y, params) {
	var basePipe = RepositoryStore.getPipe(name);
	if (!basePipe) {
		throw new Error('The pipe class doesn\'t exist');
	}

	var inputs = basePipe.inputs || 0;
	var outputs = basePipe.outputs || 0;
	// TODO: don't copy invalid params
	var parameter = merge(basePipe.parameter, params);
	if (parameter.inputs !== undefined) {
		inputs += parameter.inputs;
	}
	if (parameter.outputs !== undefined) {
		outputs += parameter.outputs;
	}
	if (parameter.pipelines !== undefined) {
		inputs += parameter.pipelines;
		outputs += parameter.pipelines;
	}

	// immutable.Range(0, inputs).map(val => null).toVector()
	var item = immutable.Map({
		type: constants.ITEM_TYPE_PIPE,
		class: name,
		inputs: immutable.Vector.from(new Array(inputs)),
		outputs: immutable.Vector.from(new Array(outputs)),
		parameter: immutable.Map(parameter),
		rect: WorkbenchLayout.getPipeFrame(x, y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addConnection({ from, to }) {
	var item1 = data.getIn(['items', from[0]]);
	var item2 = data.getIn(['items', to[0]]);
	var outputIndex = from[1];
	var inputIndex = to[1];
	if (!item1 || !item2) {
		throw new Error('Invalid item ID');
	}
	var frame1 = item1.get('rect');
	var frame2 = item2.get('rect');
	var outputs = item1.get('outputs');
	var inputs = item2.get('inputs');
	if (outputIndex < 0 || outputIndex >= outputs.length ||
	    inputIndex  < 0 || inputIndex  >= inputs.length) {
		throw new Error('Connector index out of bounds');
	}

	setData(data.withMutations(data => {
		data.updateIn(['items', from[0], 'outputs', outputIndex], () => immutable.Vector.from(to));
		data.updateIn(['items', to[0], 'inputs', inputIndex], () => immutable.Vector.from(from));
	}));
}




/*************************************************************************
 * Testing
 *************************************************************************/

// 0 .. 4
addFilter('SourceFilterExample', 20,  20);
addFilter('WorkFilterExample', 20,  90);
addFilter('EndFilter', 508, 123);
addFilter('WorkFilterExample', 20,  230);
addPipe('ForwardPipe', 300, 150, { pipelines: 3 });

addConnection({ from: [0, 0], to: [2, 0] });
addConnection({ from: [1, 0], to: [2, 1] });
addConnection({ from: [3, 0], to: [2, 2] });
// addConnection(new OutputPath(0, 0), new InputPath(2, 0));

console.log(data.toJS());

undoStack = [];
redoStack = [];