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
var CHANGE_EVENT = 'change';

// Data
var filters = immutable.Vector(
	RepositoryStore.createFilterObject('SourceFilterExample', 20,  20 + 0 * 70),
	RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 1 * 70),
	RepositoryStore.createFilterObject('EndFilter',           508, 123        ),
	RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 3 * 70)
	// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 4 * 70),
	// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 5 * 70),
	// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 6 * 70),
	// RepositoryStore.createFilterObject('WorkFilterExample',   20,  20 + 7 * 70),
	// RepositoryStore.createFilterObject('EndFilterExample',    20,  20 + 8 * 70)
);
var connections = [];

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

	props.fromOffset = calculateConnectorOffset(fromFilter.rect, numOutputs, props.fromConnector, true);
	props.toOffset = calculateConnectorOffset(toFilter.rect, numInputs, props.toConnector, false);
	props.fromPoint = props.fromOffset.add(fromFilter.rect);
	props.toPoint = props.toOffset.add(toFilter.rect);

	var index = connections.push(props) - 1;
	filters = filters.withMutations(filters => {
		filters.updateIn([props.fromFilter, 'connections'], c => c.push(index));
		filters.updateIn([props.toFilter, 'connections'], c => c.push(index));
	});
	return index;
}

/**
 * WorkbenchStore single object
 * (like a singleton)
 */
var WorkbenchStore = BaseStore.createStore({
	getFilter(id) {
		return filters.get(id);
	},
	getAllFilters() {
		return filters;
	},
	getFiltersCoveredBy(rect) {
		return filters.toMap().filter(f => rect.intersectsRect(f.get('rect')));
	},
	getItemPosition(id) {
		return filters.getIn([id, 'rect']);
	},
	getAllConnections() {
		return connections;
	},
	getConnection(id) {
		return connections[id];
	},
	getWireWidth() {
		return wireWidth;
	}
});
module.exports = WorkbenchStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.CREATE_FILTER:
		filters = filters.push(RepositoryStore.createFilterObject(action.id, action.x, action.y));
		WorkbenchStore.emitChange();
		return;

		case Constants.MOVE_SELECTED_ITEMS_BY:
		// TODO: make it work with pipes as well
		var selectedFilters = action.selectedItems;
		// item.get('type') === Constants.ITEM_TYPE_FILTER
		filters = filters.withMutations(filters => {
			selectedFilters.forEach((filter, id) => {
				filters.updateIn([id, 'rect'], rect => rect.moveBy(action.delta));
			});
		});
		WorkbenchStore.emitChange();
		// TODO: redraw wires?
		return;

		case Constants.ITEM_CLICKED:
		console.log('item clicked:', action.id);
		return;
	}
});