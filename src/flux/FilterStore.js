var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var CHANGE_EVENT = 'change';
var Store = merge(EventEmitter.prototype, {
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
module.exports = Store;

var spacing = 70;
var filters = immutable.fromJS([
	{
		class: 'SourceFilterExample',
		x: 20,
		y: 20 + 0 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 1 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 2 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 3 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 4 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 5 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 6 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 7 * spacing
	},
	{
		class: 'EndFilterExample',
		x: 20,
		y: 20 + 8 * spacing
	}
]);

function move(id, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([id, 'x'], () => x);
		filters.updateIn([id, 'y'], () => y);
	});
}

// Register for all actions
Dispatcher.register(function(action) {
	var type = action.actionType;
	if (type === Constants.FILTER_MOVE) {
		move(action.id, action.x, action.y);
		return;
	}
});