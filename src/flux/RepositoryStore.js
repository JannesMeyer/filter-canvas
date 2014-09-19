var immutable = require('immutable');
var merge = require('react/lib/merge');
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

	createFilterObject(name, x, y, params) {
		var baseFilter = filters[name];
		if (!baseFilter) {
			throw new Error('The filter class doesn\'t exist');
		}
		return immutable.Map({
			type: Constants.ITEM_TYPE_FILTER,
			class: name,
			inputs: immutable.Range(0, baseFilter.inputs),
			outputs: immutable.Range(0, baseFilter.outputs),
			parameter: immutable.Map(merge(baseFilter.parameter, params)),
			connections: immutable.Vector(),
			rect: WorkbenchLayout.getFilterFrame(x, y, name, baseFilter.inputs, baseFilter.outputs)
		});
	},

	createPipeObject(name, x, y, params) {
		var basePipe = pipes[name];
		if (!basePipe) {
			throw new Error('The pipe class doesn\'t exist');
		}
		var inputs = basePipe.inputs || 0;
		var outputs = basePipe.outputs || 0;
		// TODO: don't copy invalid params
		var parameter = merge(basePipe.parameter, params);
		if (parameter.inputs !== undefined) {
			inputs += parameter.inputs;
		}
		if (parameter.outputs !== undefined) {
			outputs += parameter.outputs;
		}
		if (parameter.pipelines !== undefined) {
			inputs += parameter.pipelines;
			outputs += parameter.pipelines;
		}

		return immutable.Map({
			type: Constants.ITEM_TYPE_PIPE,
			class: name,
			inputs: immutable.Range(0, inputs),
			outputs: immutable.Range(0, outputs),
			parameter: immutable.Map(parameter),
			connections: immutable.Vector(),
			rect: WorkbenchLayout.getPipeFrame(x, y, name, inputs, outputs)
		});
	}

});
module.exports = RepositoryStore;