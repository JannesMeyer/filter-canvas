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
// var wires = {};
// var items = {};

// Data
var itemPositions = {};
var isDragging = false;
var startMousePos;
var deltaPos;
var requestId;

/**
 * EtherMovementStore single object
 */
var EtherMovementStore = BaseStore.createStore({
	getItemPosition(id) {
		return itemPositions[id];
	},
	// TODO: why not use deltaPos?
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},
	isDragging() {
		return isDragging;
	}
});

EtherMovementStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
		startMousePos = action.mousePos;

		var items = WorkbenchStore.getAllItems();
		SelectionStore.getSelectedItemIds().forEach(id => {
			itemPositions[id] = items.getIn([id, 'rect']);
		});
		isDragging = true;
		return;

		case Constants.MOVING_SELECTED_ITEMS:
		var delta = action.mousePos.subtract(startMousePos);
		var items = WorkbenchStore.getAllItems();
		SelectionStore.getSelectedItemIds().forEach(id => {
			itemPositions[id] = items.getIn([id, 'rect']).moveBy(delta);
		});

		// if (requestId) {
		// 	return;
		// }
		// requestId = requestAnimationFrame(function() {
		EtherMovementStore.emitChange();
		return;

		case Constants.FINISH_MOVING_SELECTED_ITEMS:
		isDragging = false;
		requestId = null;
		return;
	}
});

module.exports = EtherMovementStore;