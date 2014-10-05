var immutable = require('immutable');
var merge = require('react/lib/merge');
var WorkbenchLayout = require('../interface/WorkbenchLayout');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore; // late import
var SelectionStore; // late import
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var data = immutable.Map({
	items: immutable.Vector()
});
var connectorOffsets = {};
var undoStack = [];
var redoStack = [];

var isDragging = false;
var itemPositions = immutable.Map();
var startMousePos;
// var requestId;
// var requestAnimationFrame = window.requestAnimationFrame ||
//                             window.mozRequestAnimationFrame ||
//                             window.webkitRequestAnimationFrame;

/**
 * Modify the data object
 */
function setData(newData) {
	// Push the current state to the undo stack and clear the redo stack
	undoStack.push(data);
	redoStack = [];

	if (process.env.NODE_ENV !== 'production') {
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
		// TODO: this also depends on whether the item is selected
		if (isDragging && itemPositions.has(id)) {
			return itemPositions.get(id);
		}

		return data.getIn(['items', id, 'rect']);
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

			// if (requestId) { return; }
			// requestId = requestAnimationFrame(function() {});
		break;

		case constants.FINISH_MOVING_SELECTED_ITEMS:
			isDragging = false;
			itemPositions = immutable.Map();
			// requestId = null;
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

	var item = immutable.Map({
		type: constants.ITEM_TYPE_PIPE,
		class: name,
		// inputs: immutable.Range(0, inputs).map(val => null).toVector(),
		// outputs: immutable.Range(0, outputs).map(val => null).toVector(),
		inputs: immutable.Vector.from(new Array(inputs)),
		outputs: immutable.Vector.from(new Array(outputs)),
		parameter: immutable.Map(parameter),
		rect: WorkbenchLayout.getPipeFrame(x, y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addConnection(output, input) {
	setData(data.withMutations(data => {
		data.updateIn(['items', output[0], 'outputs', output[2]], () => input);
		data.updateIn(['items', input[0],  'inputs',  input[2]],  () => output);
	}));
}




/*************************************************************************
 * Testing
 *************************************************************************/

addFilter('SourceFilterExample', 20,  20);
addFilter('WorkFilterExample', 20,  90);
addFilter('EndFilter', 508, 141);
addFilter('WorkFilterExample', 20,  230);
addPipe('ForwardPipe', 300, 150, { pipelines: 3 });

addConnection([0, 1, 0], [4, 0, 0]);
addConnection([1, 1, 0], [4, 0, 1]);
addConnection([3, 1, 0], [4, 0, 2]);

addConnection([4, 1, 0], [2, 0, 0]);
addConnection([4, 1, 1], [2, 0, 1]);
addConnection([4, 1, 2], [2, 0, 2]);

undoStack = [];
redoStack = [];