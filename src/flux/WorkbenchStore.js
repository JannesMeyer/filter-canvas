var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var WireStore = require('./WireStore');
var RepositoryStore = require('./RepositoryStore');

// Constants
var spacing = 70;
var connectorHeight = 8;
var connectorMargin = 4;
var filterPadding = 18;
var filterMinHeight = 60;
var wireWidth = 6;
var CHANGE_EVENT = 'change';

// Data
var filters = immutable.Vector();
var connections = [];
// This information is very transient
var zCounter = 10;
var activeItem = {};

// TODO: replace with actual interaction
addFilter('SourceFilterExample', 20, 20 + 0*spacing);
addFilter('WorkFilterExample',   20, 20 + 1*spacing);
addFilter('EndFilter', 508, 123);
addFilter('WorkFilterExample',   20, 20 + 3*spacing);
addFilter('WorkFilterExample',   20, 20 + 4*spacing);
addFilter('WorkFilterExample',   20, 20 + 5*spacing);
addFilter('WorkFilterExample',   20, 20 + 6*spacing);
addFilter('WorkFilterExample',   20, 20 + 7*spacing);
addFilter('EndFilterExample',    20, 20 + 8*spacing);

addConnection({
	fromFilter: 0,
	fromConnector: 0,
	toFilter: 2,
	toConnector: 0
});
addConnection({
	fromFilter: 1,
	fromConnector: 0,
	toFilter: 2,
	toConnector: 1
});
addConnection({
	fromFilter: 3,
	fromConnector: 0,
	toFilter: 2,
	toConnector: 2
});

/**
 * Calculates the offset of a connector to the top left point of its filter
 */
function calculateConnectorOffset(filterWidth, filterHeight, connectors, connectorId, isOutput) {
	var totalHeight = (connectors + 1) * connectorMargin + connectors * connectorHeight;

	var offsetX = isOutput ? filterWidth + 6 : -6;
	var offsetY = Math.round(
			(filterHeight - totalHeight) / 2 +
			(connectorId + 1) * connectorMargin +
			connectorId * connectorHeight +
			Math.floor(Math.abs(connectorHeight - wireWidth) / 2));

	return [offsetX, offsetY];
}

/**
 * Adds a connection
 *
 * props: {fromFilter, fromConnector, toFilter, toConnector}
 */
function addConnection(props) {
	var fromFilter = filters.get(props.fromFilter).toObject();
	var toFilter = filters.get(props.toFilter).toObject();

	var numOutputs = fromFilter.outputs.length;
	var numInputs = toFilter.inputs.length;
	if (props.fromConnector < 0 || props.toConnector < 0) {
		throw new Error('Only positive integers are valid connector keys');
	}
	if (props.fromConnector >= numOutputs || props.toConnector >= numInputs) {
		throw new Error('The filter doesn\'t have sufficient connectors');
	}

	props.fromOffset = calculateConnectorOffset(fromFilter.width, fromFilter.height, numOutputs, props.fromConnector, true);
	props.toOffset = calculateConnectorOffset(toFilter.width, toFilter.height, numInputs, props.toConnector, false);
	props.fromPoint = [fromFilter.x + props.fromOffset[0], fromFilter.y + props.fromOffset[1]];
	props.toPoint = [toFilter.x + props.toOffset[0], toFilter.y + props.toOffset[1]];

	var index = connections.push(props) - 1;
	filters = filters.withMutations(filters => {
		filters.updateIn([props.fromFilter, 'connections'], c => c.push(index));
		filters.updateIn([props.toFilter, 'connections'], c => c.push(index));
	});
	return index;
}

/**
 * Adds a filter
 */
function addFilter(key, x, y) {
	var base = RepositoryStore.getFilter(key);
	var width = RepositoryStore.getFilterWidth(key);
	var height = RepositoryStore.getFilterHeight(base);

	var filter = immutable.Map({
		class: key,
		inputs: immutable.Range(0, base.get('inputs')),
		outputs: immutable.Range(0, base.get('outputs')),
		connections: immutable.Vector(),
		width,
		height,
		x,
		y
	});

	filters = filters.push(filter);
	return filters.length - 1;
}

/**
 * Action: Moves the filter to a new position
 */
function moveFilterTo(filterId, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([filterId, 'x'], () => x);
		filters.updateIn([filterId, 'y'], () => y);
	});
	// TODO: better updating with filters.update(filterId, ...)
	// TODO: redraw wires?
}

/**
 * WorkbenchStore single object
 * (like a singleton)
 */
var WorkbenchStore = merge(EventEmitter.prototype, {
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
		return connections[id];
	},

	getWireWidth() {
		return wireWidth;
	},
	isNotDragging() {
		return !activeItem.dragging;
	},
	getAmountDragged(clientX, clientY) {
		var x = clientX - activeItem.clientX;
		var y = clientY - activeItem.clientY;
		return {x, y};
	},

	// EventEmitter things
	emitChange() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});
module.exports = WorkbenchStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		/**
		 * The user pushes the left mouse button on a filter
		 */
		case Constants.START_DRAG_ON_WORKBENCH:
		activeItem = {
			id: action.id,
			filter: filters.get(action.id),
			connections: filters.getIn([action.id, 'connections']),
			element: action.element,
			clientX: action.clientX,
			clientY: action.clientY,
			dragging: true
		};
		// TODO: do this smarter
		action.element.focus();
		action.element.style.zIndex = ++zCounter;
		return;

		/**
		 * The user is moving a filter
		 */
		case Constants.DRAGGING_ON_WORKBENCH:
		var {x, y} = WorkbenchStore.getAmountDragged(action.clientX, action.clientY);
		x += activeItem.filter.get('x');
		y += activeItem.filter.get('y');
		// Update filter position
		activeItem.element.style.left = x + 'px';
		activeItem.element.style.top = y + 'px';
		// Update wires
		activeItem.connections.forEach(id => {
			var cnx = connections[id];
			if (cnx.fromFilter === activeItem.id) {
				cnx.fromPoint = [x + cnx.fromOffset[0], y + cnx.fromOffset[1]];
			}
			if (cnx.toFilter === activeItem.id) {
				cnx.toPoint = [x + cnx.toOffset[0], y + cnx.toOffset[1]];
			}
			WireStore.update(id);
		});
		return;

		/**
		 * The user releases the left mouse button on a filter
		 */
		case Constants.END_DRAG_ON_WORKBENCH:
		activeItem.dragging = false;
		return;

		/**
		 * Move a filter (modifies the data)
		 */
		case Constants.MOVE_BY_ON_WORKBENCH:
		var x = activeItem.filter.get('x') + action.x;
		var y = activeItem.filter.get('y') + action.y;
		moveFilterTo(activeItem.id, x, y);
		WorkbenchStore.emitChange();
		return;

		/**
		 * The use clicked a filter without moving it
		 */
		case Constants.ITEM_CLICKED_ON_WORKBENCH:
		console.log('clicked: ' + activeItem.id);
		return;
	}
});