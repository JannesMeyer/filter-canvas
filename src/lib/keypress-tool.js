/*
 * We're using this to determine whether to register an event listener or not.
 */
var isBrowser = typeof navigator !== 'undefined';

/**
 * We're using this to determine which modifier key should be used for ctrl key combinations.
 * On Macs the command key is used for key combinations that usually use the ctrl key.
 */
var isMacBrowser = Boolean(isBrowser && navigator.platform && navigator.platform.indexOf('Mac') !== -1);

/**
 * We're using these to map from strings to key codes
 *
 * Only some keys work in Safari during fullscreen mode:
 * tab, enter, space, left, up, right, down, ; = , - . / ` [\ ] '
 */
var keyCodeMap = {
	'backspace': 8,
	'tab': 9,
	'clear': 12,
	'enter': 13,
	'return': 13,
	'esc': 27,
	'space': 32,
	'left': 37,
	'up': 38,
	'right': 39,
	'down': 40,
	'del': 46,
	'home': 36,
	'end': 35,
	'pageup': 33,
	'pagedown': 34,
	// TODO: F1-F12
	',': 188,
	'.': 190,
	'/': 191,
	'`': 192,
	'-': 189,
	'=': 187,
	';': 186,
	'\'': 222,
	'[': 219,
	']': 221,
	'\\': 220,
	'a': 65, 'b': 66, 'c': 67, 'd': 68,
	'e': 69, 'f': 70, 'g': 71, 'h': 72,
	'i': 73, 'j': 74, 'k': 75, 'l': 76,
	'm': 77, 'n': 78, 'o': 79, 'p': 80,
	'q': 81, 'r': 82, 's': 83, 't': 84,
	'u': 85, 'v': 86, 'w': 87, 'x': 88,
	'y': 89, 'z': 90
};

/**
 * Contains arrays of binding objects for each keyCode
 *
 * Example of a binding object:
 * {
 *   inputEl: false,
 *   ctrl: false,
 *   shift: false,
 *   alt: false,
 *   meta: false,
 *   callback: function(ev) {}
 * }
 */
var bindings = {};

function parseChar(char) {
	switch(typeof char) {
	case 'string':
		if (!keyCodeMap.hasOwnProperty(char)) {
			throw new Error('Invalid char');
		}
		return keyCodeMap[char];

	case 'number':
		return char;

	default:
		throw new Error('The char argument should be a String or a Number');
	}
}

/**
 * Turns an Array of conditions into an object
 */
function parseConditions(conditions) {
	var object = {
		ctrl: false,
		meta: false,
		shift: false,
		alt: false,
		inputEl: false,
		executeDefault: false
	};
	for (var i = 0; i < conditions.length; ++i) {
		object[conditions[i]] = true;
	}
	if (isMacBrowser && object.ctrl) {
		object.meta = true;
		object.ctrl = false;
	}
	return object;
}

/**
 * Make sure that everything in the first argument is present in
 * the second argument, too.
 */
function matchesSignature(signature, object) {
	var keys = Object.keys(signature);
	for (var i = 0; i < keys.length; ++i) {
		var key = keys[i];
		if (signature[key] !== object[key]) {
			return false;
		}
	}
	return true;
}

/**
 * Add a new binding
 *
 * char: String or Number
 * conditions (optional): Array containing 'ctrl', 'meta', 'shift',
 *                        'alt', 'inputEl' and/or 'executeDefault'
 * callback: Function
 *
 * Example:
 * keypress.on('backspace', function() {…});
 * keypress.on('a', ['ctrl'], function() {…});
 */
function on(char, conditions, callback) {
	if (!callback) {
		// Swap arguments 2 and 3
		callback = conditions;
		conditions = [];
	}
	var keyCode = parseChar(char);
	var binding = parseConditions(conditions);
	binding.callback = callback;

	// Create a bindingList if it doesn't exist yet
	if (!bindings.hasOwnProperty(keyCode)) {
		bindings[keyCode] = [];
	}

	// Save the binding
	bindings[keyCode].push(binding);
}

/**
 * Remove an event handler that was added with `on`
 */
function off(char, conditions, callback) {
	if (!callback) {
		// Swap arguments 2 and 3
		callback = conditions;
		conditions = [];
	}
	var keyCode = parseChar(char);
	var signature = parseConditions(conditions);
	signature.callback = callback;

	var bindingList = bindings[keyCode];
	if (!bindingList) {
		// No handler for this key exists
		return;
	}

	// Delete handler(s)
	bindingList
		.filter(binding => matchesSignature(signature, binding))
		.forEach((_, index) => bindingList.splice(index, 1));
	if (bindingList.length === 0) {
		delete bindings[keyCode];
	}
}

if (isBrowser) {
	// Export the `on` function
	exports.on = on;
	exports.off = off;

	// Install the event handler
	addEventListener('keydown', ev => {
		var bindingList = bindings[ev.keyCode];
		if (!bindingList) {
			return;
		}

		var el = ev.target;
		var signature = {
			inputEl: (el.tagName === 'INPUT' ||
			          el.tagName === 'TEXTAREA' ||
			          el.tagName === 'SELECT' ||
			          el.isContentEditable),
		  shift: ev.shiftKey,
		  ctrl:  ev.ctrlKey,
		  alt:   ev.altKey,
		  meta:  ev.metaKey
		};
		for (var i = 0; i < bindingList.length; ++i) {
			var binding = bindingList[i];
			if (matchesSignature(signature, binding)) {
				binding.callback.call(undefined, ev);
				if (!binding.executeDefault) {
					ev.stopPropagation();
					ev.preventDefault();
				}
			}
		}
	});
}