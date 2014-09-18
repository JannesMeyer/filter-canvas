var immutable = require('immutable');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var BaseStore = require('../lib/BaseStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var filters = require('../interface/FilterRepo');
var pipes = require('../interface/PipeRepo');

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
			rect: WorkbenchLayout.getFilterFrame(x, y, id, baseFilter.inputs, baseFilter.outputs)
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
			rect: WorkbenchLayout.getPipeFrame(x, y, id, basePipe.inputs, basePipe.outputs)
		});
	}

});
module.exports = RepositoryStore;