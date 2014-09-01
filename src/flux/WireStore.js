var elements = {};
var lastUpdates = {};
var fps = 30;

var WireStore = {
	update(id) {
		var element = elements[id];
		if (!element) {
			throw new Error('Unknown element ' + id);
		}
		var lastUpdate = lastUpdates[id];
		var now = Date.now();
		if (!lastUpdate || (now - lastUpdate) > (1000 / fps)) {
			element.forceUpdate();
			lastUpdates[id] = now;
		}
	},
	register(id, element) {
		elements[id] = element;
	},
	unregister(id) {
		delete elements[id];
	}
};
module.exports = WireStore;