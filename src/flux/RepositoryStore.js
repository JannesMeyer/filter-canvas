var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var filters = require('../interface/FilterRepo');
var pipes = require('../interface/PipeRepo');

// Constants
var filterConnectorHeight = 16;
var filterPadding = 18;
var filterMinHeight = 60;
var filterMinWidth = 140;
var filterTextPadding = 40;

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
			connections: immutable.Vector(),
			rect: new Rect(x, y, 150, this.getPipeHeight(basePipe))
		});
	},

	// TODO: loop through all filters in the beginning and figure these values out once and for all
	getFilterWidth(id) {
		var width = filterTextPadding + Math.round(id.length * 5.5);
		return Math.max(width, filterMinWidth);
	},
	getFilterHeight(filter) {
		var connectors = Math.max(filter.inputs, filter.outputs);
		var height = connectors * filterConnectorHeight + 2 * filterPadding;
		return Math.max(filterMinHeight, height); // TODO: eliminate filterMinHeight
	},
	getPipeHeight(basePipe) {
		var connectors = Math.max(basePipe.inputs, basePipe.outputs);
		var height = connectors * filterConnectorHeight + 2 * filterPadding;
		return Math.max(filterMinHeight, height); // TODO: eliminate filterMinHeight
	}
});
module.exports = RepositoryStore;