var events = require('events');
var merge = require('react/lib/merge');

var CHANGE_EVENT = 'change';
var BaseStore = merge(events.EventEmitter.prototype, {
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

module.exports = {
	createStore: function(extensions) {
		return merge(BaseStore, extensions);
	}
};