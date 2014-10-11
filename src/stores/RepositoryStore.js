var xhr = require('../lib/xhr-tool');
var BaseStore = require('../lib/BaseStore');
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

// TODO: don't hardcode this URL
var serverURL = 'http://127.0.0.1:5984';

// Backed by AJAX requests to CouchDB
var pipes = {};
var filters = {};
var complexFilters = {};

/**
 * RepositoryStore single object
 * (like a singleton)
 */
var RepositoryStore = BaseStore.createEventEmitter(['change'], {

	getAllPipes() {
		return pipes;
	},

	getAllFilters() {
		return filters;
	},

	getAllComplexFilters() {
		return complexFilters;
	}

});

RepositoryStore.dispatchToken = Dispatcher.register(action => {
	switch(action.actionType) {
		case Constants.RELOAD_REPOSITORY:
			reload();
		return;
	}
});

function reload() {
	// Signal that loading has started
	pipes = filters = complexFilters = null;
	RepositoryStore.emitChange();

	// Load pipes
	xhr.getJSON(serverURL + '/pipe-repository/_all_docs?include_docs=true', (err, obj) => {
		if (err) {
			pipes = new Error('Connection error');
		} else {
			pipes = {};
			obj.rows.forEach(row => {
				pipes[row.id] = row.doc;
			});
		}
		RepositoryStore.emitChange();
	});

	// Load filters
	xhr.getJSON(serverURL + '/filter-repository/_all_docs?include_docs=true', (err, obj) => {
		if (err) {
			filters = new Error('Connection error');
		} else {
			filters = {};
			obj.rows.forEach(row => {
				filters[row.id] = row.doc;
			});
		}
		RepositoryStore.emitChange();
	});

	// Load complex filters
	xhr.getJSON(serverURL + '/complex-filters/_all_docs?include_docs=true', (err, obj) => {
		if (err) {
			complexFilters = new Error('Connection error');
		} else {
			complexFilters = {};
			obj.rows.forEach(row => {
				complexFilters[row.id] = row.doc;
			});
		}
		RepositoryStore.emitChange();
	});
}

module.exports = RepositoryStore;