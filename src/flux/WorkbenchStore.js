var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var WireStore = require('./WireStore.js');

var Store = merge(EventEmitter.prototype, {
	CHANGE_EVENT: 'change',
	DRAG_EVENT: 'drag',
	getFilter(id) {
		return filters.get(id);
	},
	getAllFilters() {
		return filters;
	},
	getAllConnections() {
		return connections;
	},
	getConnection(id) {
		return connections.get(id);
	},
	getWireWidth() {
		return wireWidth;
	},
	getDragItem() {
		return dragItem;
	},
	isNotDragging() {
		return !dragItem.dragging;
	},
	getAmountDragged(clientX, clientY) {
		return {
			x: clientX - dragItem.clientX,
			y: clientY - dragItem.clientY
		};
	}
	// Store.emit(Store.CHANGE_EVENT)
	// Store.on(Store.CHANGE_EVENT, callback)
	// Store.removeListener(Store.CHANGE_EVENT, callback)
});
module.exports = Store;

var zCounter = 10;
var spacing = 70;
var connectorHeight = 8;
var connectorMargin = 4;
var filterPadding = 18;
var filterMinHeight = 60;
var wireWidth = 2;

var connections = [];

var filters = immutable.fromJS([
	{
		class: 'SourceFilterExample',
		inputs: immutable.Range(0, 0),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 0 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 1 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 3),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 400,
		y: 200
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 3 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 4 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 5 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 6 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 1),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 7 * spacing
	},
	{
		class: 'EndFilterExample',
		inputs: immutable.Range(0, 1),
		outputs: immutable.Range(0, 0),
		connections: [],
		width: 140,
		height: 60,
		x: 20,
		y: 20 + 8 * spacing
	}
]);

function calculateConnectorOffset(filter, connectorId, isOutput) {
	var width = filter.get('width');
	var height = filter.get('height');
	var inputs = filter.get('inputs').length;
	var outputs = filter.get('outputs').length;

	if (isOutput) {
		var totalHeight = (outputs + 1) * connectorMargin + outputs * connectorHeight;
		var offsetX = width + 6;
	} else {
		var totalHeight = (inputs + 1) * connectorMargin + inputs * connectorHeight;
		var offsetX = -6;
	}
	var offsetY = (height - totalHeight) / 2 + (connectorId + 1) * connectorMargin + connectorId * connectorHeight;
	offsetY += Math.floor(Math.abs(connectorHeight - wireWidth) / 2);
	return [offsetX, Math.round(offsetY)];
}

function addConnection(fromFilterId, fromConnectorId, toFilterId, toConnectorId) {
	var fromFilter = filters.get(fromFilterId);
	var fromOffset = calculateConnectorOffset(fromFilter, fromConnectorId, true);
	var fromPoint = [fromFilter.get('x') + fromOffset[0], fromFilter.get('y') + fromOffset[1]];

	var toFilter = filters.get(toFilterId);
	var toOffset = calculateConnectorOffset(toFilter, toConnectorId, false);
	var toPoint = [toFilter.get('x') + toOffset[0], toFilter.get('y') + toOffset[1]];

	var connection = {
		fromFilter: fromFilterId,
		fromConnector: fromConnectorId,
		fromOffset,
		fromPoint,
		toFilter: toFilterId,
		toConnector: toConnectorId,
		toOffset,
		toPoint
	};
	var connectionId = connections.push(connection) - 1;

	filters = filters.withMutations(filters => {
		filters.updateIn([fromFilterId, 'connections'], c => c.push(connectionId));
		filters.updateIn([toFilterId, 'connections'], c => c.push(connectionId));
	});
}
addConnection(0, 0, 2, 0);
addConnection(1, 0, 2, 1);

// This information is very transient
var dragItem = {};

function setDragItem(sourceObj) {
	dragItem.id = sourceObj.id;
	dragItem.element = sourceObj.element;
	dragItem.clientX = sourceObj.clientX;
	dragItem.clientY = sourceObj.clientY;
}

function moveFilterTo(filterId, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([filterId, 'x'], () => x);
		filters.updateIn([filterId, 'y'], () => y);
	});
	// connections = connections.withMutations(connections => {
	// 	filters.getIn([filterId, 'connections']).forEach(connectionId => {
	// 		var connection = connections.get(connectionId);

	// 		var fromFilter = connection.get('fromFilter'); // filterId
	// 		var fromConnector = connection.get('fromConnector'); // connectorId
	// 		if (fromFilter === filterId) {
	// 			var fromPoint = calculateConnectorOffset(fromFilter, fromConnector, true);
	// 			connections.updateIn([connectionId, 'fromPoint'], () => fromPoint);
	// 		}

	// 		var toFilter = connection.get('toFilter'); // filterId
	// 		var toConnector = connection.get('toConnector'); // connectorId
	// 		if (toFilter === filterId) {
	// 			var toPoint = calculateConnectorOffset(toFilter, toConnector, false);
	// 			connections.updateIn([connectionId, 'toPoint'], () => toPoint);
	// 		}
	// 	});
	// });
}

// Register for all actions
Dispatcher.register(function(action) {
	switch(action.actionType) {
	case Constants.START_DRAG_ON_WORKBENCH:
		setDragItem(action);
		dragItem.filter = filters.get(dragItem.id);
		dragItem.connections = dragItem.filter.get('connections');
		dragItem.dragging = true;

		// TODO: do this smarter
		dragItem.element.focus();
		dragItem.element.style.zIndex = ++zCounter;
		Store.emit(Store.DRAG_EVENT);
	return;

	case Constants.DRAGGING_ON_WORKBENCH:
		var {x, y} = Store.getAmountDragged(action.clientX, action.clientY);
		x += dragItem.filter.get('x');
		y += dragItem.filter.get('y');
		// Update filter position
		// dragItem.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
		dragItem.element.style.left = x + 'px';
		dragItem.element.style.top = y + 'px';
		// Update wires
		dragItem.connections.forEach(WireStore.update);
	return;

	case Constants.END_DRAG_ON_WORKBENCH:
		dragItem.dragging = false;
	return;

	case Constants.MOVE_BY_ON_WORKBENCH:
		var x = action.x + dragItem.filter.get('x');
		var y = action.y + dragItem.filter.get('y');
		moveFilterTo(dragItem.id, x, y);

		Store.emit(Store.CHANGE_EVENT);
	return;

	case Constants.ITEM_CLICKED_ON_WORKBENCH:
		console.log('clicked: ' + dragItem.id);

		Store.emit(Store.CHANGE_EVENT);
	return;
	}
});