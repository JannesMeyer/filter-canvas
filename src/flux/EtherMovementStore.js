var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var Rect = require('../lib/ImmutableRect');

var CHANGE_EVENT = 'change';
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;

// Data
var wires = {};
var isDragging = false;
var startMousePos;
var lastMousePos;
var requestId;

function updateFilter() {
	var delta = lastMousePos.subtract(startMousePos);
	// console.log(delta);
	// var frame = currentFrame.moveBy(delta);

	// Re-draw wires
	// selectedItem.connections.forEach(id => {
	// 	// Mutate the connection data
	// 	var cnx = WorkbenchStore.getConnection(id);
	// 	if (selectedItem.id === cnx.fromFilter) {
	// 		cnx.fromPoint = cnx.fromOffset.add(frame);
	// 	}
	// 	if (selectedItem.id === cnx.toFilter) {
	// 		cnx.toPoint = cnx.toOffset.add(frame);
	// 	}

	// 	wires[id].forceUpdate();
	// });

	// Re-draw filter position
	// selectedItem.element.style.left = frame.x + 'px';
	// selectedItem.element.style.top = frame.y + 'px';

	// Reset
	requestId = null;
}

/**
 * EtherMovementStore single object
 */
var EtherMovementStore = merge(EventEmitter.prototype, {
	registerWire(id, wire) {
		wires[id] = wire;
	},
	unregisterWire(id) {
		delete wires[id];
	},
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},
	isDragging() {
		return isDragging;
	},

	// TODO: remove EventEmitter things
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
			requestId = requestAnimationFrame(updateFilter);
		}
		return;

		case Constants.END_DRAG_ON_WORKBENCH:
		isDragging = false;
		requestId = null;
		return;
	}
});