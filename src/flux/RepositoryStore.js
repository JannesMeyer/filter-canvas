var BaseStore = require('../lib/BaseStore');

// Data
var filters = require('../interface/FilterRepo');
var pipes = require('../interface/PipeRepo');

/**
 * RepositoryStore single object
 * (like a singleton)
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
	}

});
module.exports = RepositoryStore;