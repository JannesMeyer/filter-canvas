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

/**
 * Add a new binding
 *
 * char: String or Number
 * conditions (optional): Array (of String)
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

	// Parse the char parameter to a keyCode
	var keyCode;
	switch(typeof char) {
		case 'string':
			keyCode = keyCodeMap[char];
			if (keyCode === undefined) {
				throw new Error('Invalid char');
			}
		break;

		case 'number':
			keyCode = char;
		break;

		default:
			throw new Error('The char argument should be a String or a Number');
	}

	// Create a bindingList if it doesn't exist yet
	if (!bindings.hasOwnProperty(keyCode)) {
		bindings[keyCode] = [];
	}

	var ctrl = conditions.indexOf('ctrl') !== -1;
	var meta = conditions.indexOf('meta') !== -1;
	var shift = conditions.indexOf('shift') !== -1;
	var alt = conditions.indexOf('alt') !== -1;
	var inputEl = conditions.indexOf('inputEl') !== -1;
	var executeDefault = conditions.indexOf('executeDefault') !== -1;
	// On a Mac [ctrl → metaKey]
	if (isMacBrowser && ctrl) {
		meta = true;
		ctrl = false;
	}
	bindings[keyCode].push({ callback, ctrl, shift, alt, meta, inputEl, executeDefault });
}

if (isBrowser) {
	// Export the `on` function
	exports.on = on;

	// Install the event handler
	addEventListener('keydown', ev => {
		var bindingList = bindings[ev.keyCode];
		if (!bindingList) {
			return;
		}

		var element = ev.target;
		var isInputEl = element.tagName === 'INPUT' ||
		                element.tagName === 'TEXTAREA' ||
		                element.tagName === 'SELECT' ||
		                element.isContentEditable;

		for (var i = 0; i < bindingList.length; ++i) {
			var binding = bindingList[i];
			var isMatch = binding.inputEl === isInputEl &&
			              binding.ctrl === ev.ctrlKey &&
			              binding.shift === ev.shiftKey &&
			              binding.alt === ev.altKey &&
			              binding.meta === ev.metaKey;
			if (!isMatch) {
				continue;
			}

			// Execute the callback
			binding.callback.call(undefined, ev);
			// And prevent the default
			if (!binding.executeDefault) {
				ev.preventDefault();
			}
		}
	});
}