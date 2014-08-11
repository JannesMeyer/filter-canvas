var EventEmitter = require('events').EventEmitter;
var Immutable = require('immutable');
var merge = require('react/lib/merge');
var dispatcher = require('./app-dispatcher');
var constants = require('./constants');

var CHANGE_EVENT = 'change';

/**
 * Immutable filter data. Every modification creates a
 * new object instead of modifying the existing one.
 */
var filters = Immutable.fromJS({
	'Filter 1': { content: 'Guten Tag!', x: 20, y: 20+0*65 },
	'Filter 2': { content: 'Guten Tag!', x: 20, y: 20+1*65 },
	'Filter 3': { content: 'Guten Tag!', x: 20, y: 20+2*65 },
	'Filter 4': { content: 'Guten Tag!', x: 20, y: 20+3*65 },
	'Filter 5': { content: 'Guten Tag!', x: 20, y: 20+4*65 },
	'Filter 6': { content: 'Guten Tag!', x: 20, y: 20+5*65 },
	'Filter 7': { content: 'Guten Tag!', x: 20, y: 20+6*65 },
	'Filter 8': { content: 'Guten Tag!', x: 20, y: 20+7*65 },
	'Filter 9': { content: 'Guten Tag!', x: 20, y: 20+8*65 },
});

/**
 * Create a new immutable object with modified x and y for the filter
 */
function move(id, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([id, 'x'], () => x);
		filters.updateIn([id, 'y'], () => y);
	});
}

/**
 * FilterStore single object
 * (like a singleton in Java)
 */
var FilterStore = merge(EventEmitter.prototype, {
	get(id) {
		return filters.get(id);
	},
	getAll() {
		return filters;
	},
	emitChange() {
		this.emit(CHANGE_EVENT);
	},
	addChangeListener(callback) {
		this.on(CHANGE_EVENT, callback);
	},
	removeChangeListener(callback) {
		this.removeListener(CHANGE_EVENT, callback);
	}
});
module.exports = FilterStore;

// Register for all actions
dispatcher.register(function(action) {
	var type = action.actionType;
	if (type === constants.FILTER_MOVE) {
		move(action.id, action.x, action.y);
		return;
	}
});