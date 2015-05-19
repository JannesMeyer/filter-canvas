import xhr from '../lib/xhr-tool';
import { createStore } from '../lib/BaseStore';
import Dispatcher from '../flux/Dispatcher';
import Constants from '../flux/Constants';
import cfg from '../config';

// Backed by AJAX requests to CouchDB
var pipes = {};
var filters = {};
var complexFilters = {};

/**
 * RepositoryStore single object (like a singleton)
 *
 * @see components/RepositoryPane.react.js
 */
var RepositoryStore = createStore(['change'], {

	/**
	 * Returns all pipes that are available in the database
	 * The value could be:
	 *  - null (which means it's loading)
	 *  - an Error instance
	 *  - an Object of Objects containing the pipe information
	 */
	getAllPipes() {
		return pipes;
	},

	/**
	 * Gets an Object with the information about a specific pipe
	 */
	getPipe(id) {
		var pipe = pipes[id];
		if (pipe instanceof Error) { return; }
		return pipe;
	},

	/**
	 * Returns all filters that are available in the database
	 * The value could be:
	 *  - null (which means it's loading)
	 *  - an Error instance
	 *  - an Object of Objects containing the filter information
	 */
	getAllFilters() {
		return filters;
	},

	/**
	 * Gets an Object with the information about a specific filter
	 */
	getFilter(id) {
		var filter = filters[id];
		if (filter instanceof Error) { return; }
		return filter;
	},

	/**
	 * Returns all complex filters that are available in the database
	 * The value could be:
	 *  - null (which means it's loading)
	 *  - an Error instance
	 *  - an Object of Objects containing the complex filter information
	 */
	getAllComplexFilters() {
		return complexFilters;
	}

});

// Register for all actions with the dispatcher
RepositoryStore.dispatchToken = Dispatcher.register(action => {
	switch(action.actionType) {

	/**
	 * Is triggered when all data should be downloaded from the database
	 */
	case Constants.RELOAD_REPOSITORY:
		reload();

	}
});

/**
 * Downloads all repository data from the CouchDB database instance
 */
function reload() {
	pipes = filters = complexFilters = null;

	// Signal that loading has started
	RepositoryStore.emitChange();

	// Load pipes
	xhr.getJSON(cfg.DB_URLS.pipes, (err, result) => {
		if (err) {
			pipes = new Error('Connection error');
		} else {
			pipes = {};
			result.rows.forEach(row => {
				pipes[row.id] = row.doc;
			});
		}

		// Refresh the UI
		RepositoryStore.emitChange();
	});

	// Load normal filters
	xhr.getJSON(cfg.DB_URLS.filters, (err, result) => {
		if (err) {
			filters = new Error('Connection error');
		} else {
			filters = {};
			result.rows.forEach(row => {
				filters[row.id] = row.doc;
			});
		}

		// Refresh the UI
		RepositoryStore.emitChange();
	});

	// Load complex filters
	// xhr.getJSON(cfg.DB_URLS.complexFilters, (err, result) => {
	// 	if (err) {
	// 		complexFilters = new Error('Connection error');
	// 	} else {
	// 		complexFilters = {};
	// 		result.rows.forEach(row => {
	// 			complexFilters[row.id] = row.doc;
	// 		});
	// 	}

	// 	// Refresh the UI
	// 	RepositoryStore.emitChange();
	// });
}

export default RepositoryStore;