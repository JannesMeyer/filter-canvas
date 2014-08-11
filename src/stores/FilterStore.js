var EventEmitter = require('events').EventEmitter;
var immutable = require('immutable');
var merge = require('react/lib/merge');
var AppDispatcher = require('../dispatcher/AppDispatcher');
var constants = require('../constants');

var CHANGE_EVENT = 'change';

var filters = immutable.fromJS({
	'Filter 1': { content: '', x: 20, y: 20+0*65 },
	'Filter 2': { content: '', x: 20, y: 20+1*65 },
	'Filter 3': { content: '', x: 20, y: 20+2*65 },
	'Filter 4': { content: '', x: 20, y: 20+3*65 },
	'Filter 5': { content: '', x: 20, y: 20+4*65 },
	'Filter 6': { content: '', x: 20, y: 20+5*65 },
	'Filter 7': { content: '', x: 20, y: 20+6*65 },
	'Filter 8': { content: '', x: 20, y: 20+7*65 },
	'Filter 9': { content: '', x: 20, y: 20+8*65 },
});

function move(id, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([id, 'x'], () => x);
		filters.updateIn([id, 'y'], () => y);
	});
}

var FilterStore = merge(EventEmitter.prototype, {
	getAll: function() {
		return filters;
	},
	get: function(id) {
		return filters.get(id);
	},
	emitChange: function() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener: function(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener: function(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});

AppDispatcher.register(function(payload) {
	var action = payload.action;

	switch(action.actionType) {
		case constants.FILTER_MOVE:
			move(action.id, action.x, action.y);
			// No re-render needed
			// FilterStore.emitChange();
			break;
	}

	return true; // No errors.  Needed by promise in Dispatcher.
});

module.exports = FilterStore;