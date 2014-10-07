var immutable = require('immutable');
var Point = require('../lib/ImmutablePoint');
var merge = require('react/lib/merge');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore; // late import
var SelectionStore; // late import
var dispatcher = require('./dispatcher');
var constants = require('./constants');

var loadComplete = false;
var workbenchNode;

// Data
var data = immutable.Map({
	items: immutable.Vector()
});
var undoStack = [];
var redoStack = [];
var isDragging = false;
var startMousePos;
var itemPositions = immutable.Map();
var connectorOffsets = {};

/**
 * Modify the data object
 */
function setData(newData) {
	// Push the current state onto the undo stack and clear the redo stack
	undoStack.push(data);
	redoStack = [];

	if (process.env.NODE_ENV !== 'production' && loadComplete) {
		console.log(newData.get('items').toJS());
	}

	// Change the data object
	data = newData;
	WorkbenchStore.emitChange();
}

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
var WorkbenchStore = BaseStore.createEventEmitter(['change'], {

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
		if (isDragging && itemPositions.has(id)) {
			return itemPositions.get(id);
		} else {
			return data.getIn(['items', id, 'rect']);
		}
	},

	/**
	 * Calculates the movement vector
	 */
	// TODO: why not use deltaPos?
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},

	/**
	 * returns whether any items are being moved right now
	 */
	isDragging() {
		return isDragging;
	},

	/**
	 * Caches the offset values from `WorkbenchLayout.getConnectorOffset()`
	 * c: Path (in array form) of a connector
	 */
	getConnectorOffset(cnrPath) {
		// Implicitly calls cnrPath.toString(), because only Strings
		// can be keys of an Object
		var offset = connectorOffsets[cnrPath];
		if (offset) {
			// Return the cached value
			return offset;
		}

		var itemId = cnrPath[0];
		var isOutput = cnrPath[1];
		var connectorId = cnrPath[2];

		// Calculate the offset value
		var item = data.getIn(['items', itemId]);
		if (!item) {
			throw new Error('Invalid item ID');
		}
		var frame = item.get('rect');
		var numConnectors = item.get(isOutput ? 'outputs' : 'inputs').length;
		if (connectorId < 0 || connectorId >= numConnectors) {
			throw new Error('Invalid connector index');
		}

		// Save it to the cache and return it
		return connectorOffsets[cnrPath] = WorkbenchLayout.getConnectorOffset(frame, numConnectors, isOutput, connectorId);
	},

	getConnectorPosition(address) {
		var itemPos = this.getItemPosition(address[0]);
		return itemPos.moveBy(this.getConnectorOffset(address));
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
	},

	/**
	 * Will be replaced by a function that returns the scroll offset
	 * of the Workbench that was initialized most recently (there
	 * should be only one Workbench anyway)
	 */
	getScrollOffset: undefined

});

WorkbenchStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.CREATE_ITEM:
			if (action.type === constants.ITEM_TYPE_FILTER) {
				addFilter(action.id, action.position);
			} else if (action.type === constants.ITEM_TYPE_PIPE) {
				addPipe(action.id, action.position);
			} else {
				throw new Error('Invalid type');
			}
		break;

		case constants.MOVE_SELECTED_ITEMS_BY:
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta));
				});
			}));
			// TODO: redraw wires?
		break;

		case constants.DELETE_SELECTED_ITEMS:
			var deleteItems = action.selectedItems;
			if (deleteItems.length === 0) {
				break;
			}

			// TODO: deleting items leads to a sparse array
			// TODO: should old IDs be reused?
			setData(data.updateIn(['items'], items => items.withMutations(items => {
				// Clear connections (they work similar to doubly linked lists)
				var clearConnectors = immutable.Sequence();
				deleteItems.forEach(itemId => {
					var item = data.getIn(['items', itemId]);
					clearConnectors = clearConnectors.concat(item.get('inputs'));
					clearConnectors = clearConnectors.concat(item.get('outputs'));
				});
				clearConnectors.forEach(c => {
					if (!c || deleteItems.has(c[0])) { return; }
					items.updateIn([c[0], (c[1] ? 'outputs' : 'inputs'), c[2]], () => undefined);
				});

				// Delete items
				deleteItems.forEach(itemId => {
					items.remove(itemId);
				});
			})));
		break;

		case constants.FINISH_CONNECTION:
			addConnection(action.from, action.to);
		break;

		case constants.DELETE_CONNECTION:
			var c1 = action.connector1;
			var c2 = action.connector2;
			setData(data.withMutations(data => {
				data.updateIn(['items', c1[0], (c1[1] ? 'outputs' : 'inputs'), c1[2]], () => undefined);
				data.updateIn(['items', c2[0], (c2[1] ? 'outputs' : 'inputs'), c2[2]], () => undefined);
			}));
		break;

		case constants.UNDO:
			undo();
		break;

		case constants.REDO:
			redo();
		break;

		case constants.START_MOVING_SELECTED_ITEMS:
			isDragging = true;
			startMousePos = action.mousePos;
			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']);
			}).toMap();
		break;

		case constants.MOVING_SELECTED_ITEMS:
			var delta = action.mousePos.subtract(startMousePos);

			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']).moveBy(delta);
			}).toMap();

			// TODO: emit a special signal
			WorkbenchStore.emitChange();
		break;

		case constants.FINISH_MOVING_SELECTED_ITEMS:
			isDragging = false;
			itemPositions = immutable.Map();
		break;
	}
});

module.exports = WorkbenchStore;

// Requiring after the export prevents problems with circular dependencies
RepositoryStore = require('./RepositoryStore');
SelectionStore = require('./SelectionStore');








/*************************************************************************
 * Item adding
 *************************************************************************/

function addFilter(name, pos, params) {
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
		rect: WorkbenchLayout.getFilterFrame(pos.x, pos.y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addPipe(name, pos, params) {
	var basePipe = RepositoryStore.getPipe(name);
	if (!basePipe) {
		throw new Error('The pipe class doesn\'t exist');
	}
	var inputs = basePipe.inputs || 0;
	var outputs = basePipe.outputs || 0;
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

	var item = immutable.Map({
		type: constants.ITEM_TYPE_PIPE,
		class: name,
		// inputs: immutable.Range(0, inputs).map(val => null).toVector(),
		inputs: immutable.Vector.from(new Array(inputs)),
		outputs: immutable.Vector.from(new Array(outputs)),
		parameter: immutable.Map(parameter),
		rect: WorkbenchLayout.getPipeFrame(pos.x, pos.y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addConnection(output, input) {
	// If they arrive in reverse order swap them
	if (!output[1] && input[1]) {
		[input, output] = [output, input];
	}
	var p1 = data.getIn(['items', output[0], 'outputs', output[2]]);
	var p2 = data.getIn(['items', input[0], 'inputs', input[2]]);
	if (p1) {
		throw new Error('The connector ' + p1 + ' already has a connection');
	}
	if (p2) {
		throw new Error('The connector ' + p2 + ' already has a connection');
	}

	setData(data.withMutations(data => {
		data.updateIn(['items', output[0], 'outputs', output[2]], () => input);
		data.updateIn(['items', input[0],  'inputs',  input[2]],  () => output);
	}));
}




/*************************************************************************
 * Testing
 *************************************************************************/

addFilter('SourceFilterExample', new Point(20, 20));
addFilter('WorkFilterExample',   new Point(20, 90));
addFilter('EndFilter',           new Point(508, 141));
addFilter('WorkFilterExample',   new Point(20,  230));
addPipe('ForwardPipe',           new Point(300, 150), { pipelines: 3 });
addFilter('WorkFilterExample',   new Point(60, 380));
addPipe('ForwardPipe',           new Point(350, 250));
addPipe('ForwardPipe',           new Point(450, 250));
addFilter('WorkFilterExample',   new Point(400,  380));

addConnection([0, 1, 0], [4, 0, 0]);
addConnection([1, 1, 0], [4, 0, 1]);
addConnection([3, 1, 0], [4, 0, 2]);

addConnection([4, 1, 0], [2, 0, 0]);
addConnection([4, 1, 1], [2, 0, 1]);
addConnection([4, 1, 2], [5, 0, 0]);
addConnection([5, 1, 0], [6, 0, 0]);
addConnection([6, 1, 0], [2, 0, 2]);

loadComplete = true;