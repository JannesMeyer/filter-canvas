var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

// Constants
var filterConnectorHeight = 16;
var filterPadding = 18;
var filterMinHeight = 60;

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
var RepositoryStore = merge(EventEmitter.prototype, {
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

	getFilterWidth(key) {
		// TODO: implement
		return 140;
	},
	getFilterHeight(filter) {
		var connectors = Math.max(filter.get('inputs'), filter.get('outputs'));
		var height = connectors * filterConnectorHeight + 2 * filterPadding;
		return Math.max(filterMinHeight, height); // TODO: eliminate filterMinHeight
	},

	// EventEmitter things
	FILTERS_CHANGE: 'filters change',
	PIPES_CHANGE: 'pipes change'
});
module.exports = RepositoryStore;

// Register for all actions
// Dispatcher.register(function(action) {
// 	var type = action.actionType;
// });