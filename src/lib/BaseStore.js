var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var BaseStore = {

	createEventEmitter(eventNames, extensions) {
		eventNames.forEach(eventName => {
			var Name = eventName.charAt(0).toUpperCase() + eventName.substr(1);
			extensions['emit' + Name] = function() {
				this.emit(eventName);
			};
			extensions['add' + Name + 'Listener'] = function(callback) {
				this.on(eventName, callback);
			};
			extensions['remove' + Name + 'Listener'] = function(callback) {
				this.removeListener(eventName, callback);
			};
		});

		return merge(EventEmitter.prototype, extensions).setMaxListeners(0);
	}

};
module.exports = BaseStore;