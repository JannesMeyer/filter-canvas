var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var filters = require('../interface/FilterRepo');
var pipes = require('../interface/PipeRepo');

// Constants
var connectorHeight = 16;

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
		return filters[id];
	},

	getAllPipes() {
		return pipes;
	},

	getPipe(id) {
		return pipes[id];
	},

	createFilterObject(id, x, y) {
		var baseFilter = filters[id];
		if (!baseFilter) {
			throw new Error('The filter class doesn\'t exist');
		}
		return immutable.Map({
			type: Constants.ITEM_TYPE_FILTER,
			class: id,
			inputs: immutable.Range(0, baseFilter.inputs),
			outputs: immutable.Range(0, baseFilter.outputs),
			parameter: immutable.Map(baseFilter.parameter),
			connections: immutable.Vector(),
			rect: new Rect(x, y, this.getFilterWidth(id), this.getFilterHeight(baseFilter))
		});
	},

	createPipeObject(id, x, y) {
		var basePipe = pipes[id];
		if (!basePipe) {
			throw new Error('The pipe class doesn\'t exist');
		}
		return immutable.Map({
			type: Constants.ITEM_TYPE_PIPE,
			class: id,
			inputs: immutable.Range(0, basePipe.inputs),
			outputs: immutable.Range(0, basePipe.outputs),
			parameter: immutable.Map(basePipe.parameter),
			connections: immutable.Vector(),
			rect: new Rect(x, y, 40, this.getPipeHeight(basePipe))
		});
	},

	// TODO: loop through all filters in the beginning and figure these values out once and for all
	getFilterWidth(id) {
		return Math.max(140, Math.floor(id.length * 5.5) + 40);
	},

	getFilterHeight(baseFilter) {
		var c = Math.max(baseFilter.inputs, baseFilter.outputs);
		return Math.max(60, c * connectorHeight + 28);
	},

	getPipeHeight(basePipe) {
		var c = Math.max(basePipe.inputs, basePipe.outputs);
		return Math.max(32, c * connectorHeight);
	}

});
module.exports = RepositoryStore;