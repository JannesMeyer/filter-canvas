var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var SelectionStore = require('./SelectionStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;

// React components
var wires = {};
var items = {};

// Data
var isDragging = false;
var startMousePos;
var lastMousePos;
var requestId;

// TODO: don't use forceUpdate and manual element updating anymore.
// Make the dragging part of the state instead and ask EtherMovementStore
// for position information instead of the WorkbenchStore.

function update() {
	var delta = lastMousePos.subtract(startMousePos);
	var wiresToBeRedrawn = {};

	SelectionStore.getSelectedItemIds().forEach(id => {
		// TODO: use getItem()
		var item = WorkbenchStore.getFilter(id);
		var frame = item.get('rect').moveBy(delta);

		item.get('connections').forEach(cId => {
			var connection = WorkbenchStore.getConnection(cId);
			if (id === connection.fromFilter) {
				connection.fromPoint = connection.fromOffset.add(frame);
			}
			if (id === connection.toFilter) {
				connection.toPoint = connection.toOffset.add(frame);
			}
			wiresToBeRedrawn[cId] = null;
			// wires[cId].forceUpdate();
		});

		// Re-draw filter position
		var element = items[id].getDOMNode();
		element.style.left = frame.x + 'px';
		element.style.top = frame.y + 'px';
	});

	// Re-draw wires
	// TODO: don't re-draw if only the position changed, but not the size
	Object.keys(wiresToBeRedrawn).forEach(id => {
		wires[id].forceUpdate();
	});

	requestId = null;
}

/**
 * EtherMovementStore single object
 */
var EtherMovementStore = BaseStore.createStore({
	registerWire(id, component) {
		wires[id] = component;
	},
	unregisterWire(id) {
		delete wires[id];
	},
	registerItem(id, component) {
		items[id] = component;
	},
	unregisterItem(id, component) {
		delete items[id];
	},
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},
	isDragging() {
		return isDragging;
	}
});
module.exports = EtherMovementStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
		startMousePos = action.mousePos;
		isDragging = true;
		return;

		case Constants.MOVING_SELECTED_ITEMS:
		lastMousePos = action.mousePos;
		if (!requestId) {
			requestId = requestAnimationFrame(update);
		}
		return;

		case Constants.FINISH_MOVING_SELECTED_ITEMS:
		isDragging = false;
		requestId = null;
		return;
	}
});