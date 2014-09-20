var immutable = require('immutable');
var Point = require('../lib/ImmutablePoint');
var merge = require('react/lib/merge');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore = require('./RepositoryStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var data = immutable.Map({
	items: immutable.Vector(
		createFilterObject('SourceFilterExample', 20,  20 + 0 * 70),
		createFilterObject('WorkFilterExample',   20,  20 + 1 * 70),
		createFilterObject('EndFilter',           508, 123        ),
		createFilterObject('WorkFilterExample',   20,  20 + 3 * 70),
		createPipeObject('ForwardPipe', 300, 150, { pipelines: 3 })
	),
	connections: immutable.Vector()
});
var undoSteps = [];
var redoSteps = [];

function setData(newData) {
	// Push the current state to the undo stack and clear the redo stack
	undoSteps.push(data);
	redoSteps = [];

	// Change the data object
	data = newData;
	WorkbenchStore.emitChange();
}

/**
 * Undo the previous action
 */
function undo() {
	if (undoSteps.length === 0) {
		return;
	}
	redoSteps.push(data);

	// Change the data object
	data = undoSteps.pop();
	WorkbenchStore.emitChange();
}

/**
 * Redo the following action
 */
function redo() {
	if (redoSteps.length === 0) {
		return;
	}
	undoSteps.push(data);

	// Change the data object
	data = redoSteps.pop();
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
	 * returns an immutable.Vector
	 */
	getAllConnections() {
		return data.get('connections');
	},
	/**
	 * returns an immutable.Map
	 */
	getConnection(id) {
		return data.getIn(['connections', id]);
	},
	/**
	 * returns a boolean
	 */
	hasUndoSteps() {
		return undoSteps.length !== 0;
	},
	/**
	 * returns a boolean
	 */
	hasRedoSteps() {
		return redoSteps.length !== 0;
	}
});

WorkbenchStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.CREATE_ITEM:
			var item;
			if (action.type === Constants.ITEM_TYPE_FILTER) {
				item = createFilterObject(action.id, action.x, action.y);
			} else if (action.type === Constants.ITEM_TYPE_PIPE) {
				item = createPipeObject(action.id, action.x, action.y);
			} else {
				throw new Error('Invalid type');
			}
			setData(data.updateIn(['items'], items => items.push(item)));
		break;

		case Constants.MOVE_SELECTED_ITEMS_BY:
			// item.get('type') === Constants.ITEM_TYPE_FILTER
			// TODO: improve the updating
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta));
				});
			}));
			// TODO: redraw wires?
		break;

		case Constants.DELETE_SELECTED_ITEMS:
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

		case Constants.UNDO:
			undo();
		break;

		case Constants.REDO:
			redo();
		break;
	}
});

module.exports = WorkbenchStore;

/**
 * Adds a connection
 */
function addConnection({ fromItem, fromConnector, toItem, toConnector }) {
	var item1 = data.getIn(['items', fromItem]);
	var item2 = data.getIn(['items', toItem]);
	if (!item1) {
		throw new Error('The source filter doesn\'t exist');
	}
	if (!item2) {
		throw new Error('The target filter doesn\'t exist');
	}
	var numOutputs = item1.get('outputs').length;
	var numInputs = item2.get('inputs').length;
	if (fromConnector < 0 || toConnector < 0) {
		throw new Error('Only positive integers are valid connector keys');
	}
	if (fromConnector >= numOutputs || toConnector >= numInputs) {
		throw new Error('The filter doesn\'t have sufficient connectors');
	}

	var cn = immutable.Map({
		fromItem,
		fromConnector,
		fromOffset: WorkbenchLayout.getConnectorOffset(item1.get('rect'), numOutputs, fromConnector, true),
		toItem,
		toConnector,
		toOffset: WorkbenchLayout.getConnectorOffset(item2.get('rect'), numInputs, toConnector, false)
	});
	var cnId = data.get('connections').length;

	setData(data.withMutations(data => {
		data.updateIn(['connections'], cns => cns.push(cn));
		data.updateIn(['items', fromItem, 'connections'], cns => cns.push(cnId));
		data.updateIn(['items', toItem, 'connections'], cns => cns.push(cnId));
	}));
}


/*************************************************************************
 * Item adding
 *************************************************************************/

function createFilterObject(name, x, y, params) {
	var baseFilter = RepositoryStore.getFilter(name);
	if (!baseFilter) {
		throw new Error('The filter class doesn\'t exist');
	}
	return immutable.Map({
		type: Constants.ITEM_TYPE_FILTER,
		class: name,
		inputs: immutable.Range(0, baseFilter.inputs),
		outputs: immutable.Range(0, baseFilter.outputs),
		parameter: immutable.Map(merge(baseFilter.parameter, params)),
		connections: immutable.Vector(),
		rect: WorkbenchLayout.getFilterFrame(x, y, name, baseFilter.inputs, baseFilter.outputs)
	});
}

function createPipeObject(name, x, y, params) {
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

	return immutable.Map({
		type: Constants.ITEM_TYPE_PIPE,
		class: name,
		inputs: immutable.Range(0, inputs),
		outputs: immutable.Range(0, outputs),
		parameter: immutable.Map(parameter),
		connections: immutable.Vector(),
		rect: WorkbenchLayout.getPipeFrame(x, y, name, inputs, outputs)
	});
}







/*************************************************************************
 * Testing
 *************************************************************************/

addConnection({
	fromItem: 0,
	fromConnector: 0,
	toItem: 2,
	toConnector: 0
});
addConnection({
	fromItem: 1,
	fromConnector: 0,
	toItem: 2,
	toConnector: 1
});
addConnection({
	fromItem: 3,
	fromConnector: 0,
	toItem: 2,
	toConnector: 2
});
undoSteps = [];
redoSteps = [];