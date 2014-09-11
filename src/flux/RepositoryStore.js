var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Constants
var filterConnectorHeight = 16;
var filterPadding = 18;
var filterMinHeight = 60;
var filterMinWidth = 140;
var filterTextPadding = 40;

// Data
var filters = immutable.fromJS({
	SourceFilterExample: {
		inputs: 0,
		outputs: 1,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	WorkFilterExample: {
		inputs: 1,
		outputs: 1,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	EndFilterExample: {
		inputs: 1,
		outputs: 0,
		parameter: {
			waitMin: 10,
			waitMax: 500000
		}
	},
	EndFilter: {
		inputs: 3,
		outputs: 0
	},
	OpenCVImageSource: {
		inputs: 1,
		outputs: 1
	},
	RgbToGrayFilter: {
		inputs: 1,
		outputs: 0
	},
	FindEdges: {
		inputs: 1,
		outputs: 0
	},
	GLFWImageSink: {
		inputs: 1,
		outputs: 0
	},
	W: {
		inputs: 2,
		outputs: 1
	},
	E: {
		inputs: 2,
		outputs: 0
	}
});
var pipes = immutable.fromJS({
	ForwardingPipe: {
		inputs: 1,
		outputs: 1
	},
	SplitPipe: {
		inputs: 1,
		outputs: 2
	},
	JoinPipe: {
		inputs: 2,
		outputs: 1
	}
});

/**
 * RepositoryStore single object
 * (like a singleton)
 *
 * RepositoryStore.emit(RepositoryStore.FILTERS_CHANGE)
 * RepositoryStore.on(RepositoryStore.FILTERS_CHANGE, callback)
 * RepositoryStore.removeListener(RepositoryStore.FILTERS_CHANGE, callback)
 */
var RepositoryStore = BaseStore.createStore({
	getAllFilters() {
		return filters;
	},
	getFilter(id) {
		return filters.get(id);
	},
	getAllPipes() {
		return pipes;
	},
	getPipe(id) {
		return pipes.get(id);
	},
	createFilterObject(id, x, y) {
		var type = filters.get(id);
		if (!type) {
			throw new Error('The filter type doesn\'t exist');
		}

		var filter = immutable.Map({
			type: Constants.ITEM_TYPE_FILTER,
			class: id,
			inputs: immutable.Range(0, type.get('inputs')),
			outputs: immutable.Range(0, type.get('outputs')),
			connections: immutable.Vector(),
			rect: new Rect(x, y, this.getFilterWidth(id), this.getFilterHeight(type))
		});
		return filter;
	},
	createPipeObject(id, x, y) {
		return immutable.Map();
	},

	// TODO: loop through all filters in the beginning and figure these values out once and for all
	getFilterWidth(id) {
		var width = filterTextPadding + Math.round(id.length * 5.5);
		return Math.max(width, filterMinWidth);
	},
	getFilterHeight(filter) {
		var connectors = Math.max(filter.get('inputs'), filter.get('outputs'));
		var height = connectors * filterConnectorHeight + 2 * filterPadding;
		return Math.max(filterMinHeight, height); // TODO: eliminate filterMinHeight
	}
});
module.exports = RepositoryStore;