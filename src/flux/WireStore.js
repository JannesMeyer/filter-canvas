var elements = {};

var WireStore = {
	update(id) {
		var element = elements[id];
		if (element) {
			element.draw();
		} else {
			throw new Error('Unknown element ' + id);
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