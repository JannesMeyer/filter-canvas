var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');
var ImmutableRect = require('../lib/ImmutableRect');

var RepositoryStore = require('./RepositoryStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

// Constants
var connectorHeight = 8;
var connectorMargin = 4;
var wireWidth = 6;
var CHANGE_EVENT = 'change';

// Data
var filters = immutable.Vector();
var connections = [];

// TODO: replace with actual interaction
addFilter('SourceFilterExample', 20,  20 + 0 * 70);
addFilter('WorkFilterExample',   20,  20 + 1 * 70);
addFilter('EndFilter',           508, 123);
addFilter('WorkFilterExample',   20,  20 + 3 * 70);
// addFilter('WorkFilterExample',   20,  20 + 4 * 70);
// addFilter('WorkFilterExample',   20,  20 + 5 * 70);
// addFilter('WorkFilterExample',   20,  20 + 6 * 70);
// addFilter('WorkFilterExample',   20,  20 + 7 * 70);
// addFilter('EndFilterExample',    20,  20 + 8 * 70);

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
	var fromFilter = filters.get(props.fromFilter);
	var toFilter = filters.get(props.toFilter);

	if (!fromFilter) {
		throw new Error('The source filter doesn\'t exist');
	}
	if (!toFilter) {
		throw new Error('The target filter doesn\'t exist');
	}

	fromFilter = fromFilter.toObject();
	toFilter = toFilter.toObject();

	var numOutputs = fromFilter.outputs.length;
	var numInputs = toFilter.inputs.length;
	if (props.fromConnector < 0 || props.toConnector < 0) {
		throw new Error('Only positive integers are valid connector keys');
	}
	if (props.fromConnector >= numOutputs || props.toConnector >= numInputs) {
		throw new Error('The filter doesn\'t have sufficient connectors');
	}

	props.fromOffset = calculateConnectorOffset(fromFilter.rect.width, fromFilter.rect.height, numOutputs, props.fromConnector, true);
	props.toOffset = calculateConnectorOffset(toFilter.rect.width, toFilter.rect.height, numInputs, props.toConnector, false);
	props.fromPoint = [fromFilter.rect.x + props.fromOffset[0], fromFilter.rect.y + props.fromOffset[1]];
	props.toPoint = [toFilter.rect.x + props.toOffset[0], toFilter.rect.y + props.toOffset[1]];

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
function addFilter(id, x, y) {
	var next = filters.push(RepositoryStore.createFilterObject(id, x, y));
	filters = next;
	return next.length - 1;
}

/**
 * Action: Moves the filter to a new position
 */
function moveFilterBy(filterId, x, y) {
	filters = filters.updateIn([filterId, 'rect'], r => r.moveBy(x, y));
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
	getFiltersCoveredBy(rect) {
		return filters.filter(f => rect.intersects(f.get('rect')));
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
		case Constants.CREATE_FILTER:
		addFilter(action.id, action.x, action.y);
		WorkbenchStore.emitChange();
		return;

		case Constants.MOVE_BY_ON_WORKBENCH:
		moveFilterBy(action.id, action.x, action.y);
		WorkbenchStore.emitChange();
		return;

		case Constants.ITEM_CLICKED_ON_WORKBENCH:
		console.log('item clicked:', action.id);
		return;
	}
});