var EventEmitter = require('events').EventEmitter;
var assign = require('react/lib/Object.assign');

/**
 * This function creates objects that are based on EventEmitter.
 * EventEmitter is part of the NodeJS API and is made usable in the
 * browser by webpack.
 *
 * EventEmitter documentation:
 * http://nodejs.org/api/events.html#events_class_events_eventemitter
 *
 * Arguments:
 * eventNames: Array of Strings that represent the event names
 * extensions: Object that will be merged with an EventEmitter instance
 *
 * Example:
 *   createEventEmitter(['change', 'paramChange'], { otherFunction: function(){} })
 *
 * Will create an object like this:
 *   {
 *     'emitChange': [Function],
 *     'addChangeListener': [Function],
 *     'removeChangeListener': [Function],
 *     'emitParamChange': [Function],
 *     'addParamChangeListener': [Function],
 *     'removeParamChangeListener': [Function],
 *     'otherFunction': [Function]
 *   }
 */
function createEventEmitter(eventNames, extensions) {
	eventNames.forEach(eventName => {
		// Capitalize the first letter of the name
		var Name = eventName.charAt(0).toUpperCase() + eventName.substr(1);

		// Add the emit/addListener/removeListener convenience functions
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

	// Create the EventEmitter instance (and remove the listener limit)
	return assign({}, EventEmitter.prototype, extensions).setMaxListeners(0);
}

module.exports.createEventEmitter = createEventEmitter;