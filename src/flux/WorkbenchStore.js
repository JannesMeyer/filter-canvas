var immutable = require('immutable');
var Point = require('../lib/ImmutablePoint');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore = require('./RepositoryStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Constants
var connectorHeight = 8;
var connectorMargin = 4;
var wireWidth = 5;

// Data
var data = immutable.Map({
	items: immutable.Vector(
		RepositoryStore.createFilterObject('SourceFilterExample', 20,  20 + 0 * 70),
		RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 1 * 70),
		RepositoryStore.createFilterObject('EndFilter',           508, 123        ),
		RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 3 * 70)
		// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 4 * 70),
		// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 5 * 70),
		// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 6 * 70),
		// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 7 * 70),
		// RepositoryStore.createFilterObject('EndFilterExample',    20,  20 + 8 * 70)
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
	getAllItems() {
		return data.get('items');
	},
	getItem(id) {
		return data.getIn(['items', id]);
	},
	getItemsCoveredBy(rect) {
		return data.get('items').toMap().filter(f => rect.intersectsRect(f.get('rect')));
	},
	getItemPosition(id) {
		return data.getIn(['items', id, 'rect']);
	},
	getAllConnections() {
		return data.get('connections');
	},
	getConnection(id) {
		return data.getIn(['connections', id]);
	},
	getWireWidth() {
		return wireWidth;
	},
	hasUndoSteps() {
		return undoSteps.length !== 0;
	},
	hasRedoSteps() {
		return redoSteps.length !== 0;
	}
});
module.exports = WorkbenchStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.CREATE_ITEM:
			var item;
			if (action.type === Constants.ITEM_TYPE_FILTER) {
				item = RepositoryStore.createFilterObject(action.id, action.x, action.y);
			} else if (action.type === Constants.ITEM_TYPE_PIPE) {
				item = RepositoryStore.createPipeObject(action.id, action.x, action.y);
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
			// TODO: improve updating
			// TODO: remove other filter's connection references
			// TODO: clear selection in SelectionStore (but waitFor WorkbenchStore)
			var connectionDeleteList = immutable.Set().asMutable();
			setData(data.withMutations(data => {
				// Delete items
				data.updateIn(['items'], items => {
					action.selectedItems.forEach(itemId => {
						// Collect connections to delete
						connectionDeleteList.union(data.getIn(['items', itemId, 'connections']));
						// Delete item
						items = items.delete(itemId);
					});
					return items;
				});

				// Delete connections
				data.updateIn(['connections'], cns => {
					connectionDeleteList.forEach(cnId => {
						cns = cns.delete(cnId);
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








/**
 * Calculates the offset of a connector to the top left point of its filter
 */
function calculateConnectorOffset(filterFrame, connectors, connectorId, isOutput) {
	var totalHeight = (connectors + 1) * connectorMargin + connectors * connectorHeight;
	var x = isOutput ? filterFrame.width + 6 : -6;
	var y = Math.round(
			(filterFrame.height - totalHeight) / 2 +
			(connectorId + 1) * connectorMargin +
			connectorId * connectorHeight +
			Math.floor(Math.abs(connectorHeight - wireWidth) / 2));
	return new Point(x, y);
}

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
		fromOffset: calculateConnectorOffset(item1.get('rect'), numOutputs, fromConnector, true),
		toItem,
		toConnector,
		toOffset: calculateConnectorOffset(item2.get('rect'), numInputs, toConnector, false)
	});
	var cnId = data.get('connections').length;

	setData(data.withMutations(data => {
		data.updateIn(['connections'], cns => cns.push(cn));
		data.updateIn(['items', fromItem, 'connections'], cns => cns.push(cnId));
		data.updateIn(['items', toItem, 'connections'], cns => cns.push(cnId));
	}));
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