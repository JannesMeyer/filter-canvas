var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var merge = require('react/lib/merge');
var EventEmitter = require('events').EventEmitter;
var Rect = require('../lib/ImmutableRect');

var CHANGE_EVENT = 'change';
var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;

// Data
var wires = {};
var selection = { active: false };
var isDragging = false;
var selectedItem = { dragging: false };
var requestId;
var zCounter = 10;

function updateFilter() {
	var delta = selectedItem.lastMousePos.subtract(selectedItem.startMousePos);
	var frame = selectedItem.filterFrame.moveBy(delta);

	// Re-draw wires
	selectedItem.connections.forEach(id => {
		// Mutate the connection data
		var cnx = WorkbenchStore.getConnection(id);
		if (selectedItem.id === cnx.fromFilter) {
			cnx.fromPoint = cnx.fromOffset.add(frame);
		}
		if (selectedItem.id === cnx.toFilter) {
			cnx.toPoint = cnx.toOffset.add(frame);
		}

		wires[id].forceUpdate();
	});

	// Re-draw filter position
	selectedItem.element.style.left = frame.x + 'px';
	selectedItem.element.style.top = frame.y + 'px';

	// Reset
	requestId = null;
}

/**
 * SelectionStore single object
 */
var SelectionStore = merge(EventEmitter.prototype, {
	// Filter drag and drop
	getAmountDragged(mousePos) {
		return mousePos.subtract(selectedItem.startMousePos);
	},
	getSelectedItemId() {
		return selectedItem.id;
	},
	getSelectedItemType() {
		return selectedItem.type;
	},
	isDragging() {
		return selectedItem.dragging;
	},
	registerWire(id, wire) {
		wires[id] = wire;
	},
	unregisterWire(id) {
		delete wires[id];
	},

	// Selection
	getSelectionRect() {
		return Rect.fromTwoPoints(selection.startPos, selection.currentPos);
	},
	isSelecting() {
		return selection.active;
	},

	// EventEmitter things
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
module.exports = SelectionStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_DRAG_ON_WORKBENCH:
		// Set selectedItem
		var filter = WorkbenchStore.getFilter(action.id);
		selectedItem = {
			type: 'WFilter',
			id: action.id,
			element: action.element,
			startMousePos: action.mousePos,
			filterFrame: filter.get('rect'),
			connections: filter.get('connections'),
			dragging: true
		};
		// Focus filter element
		action.element.focus();
		action.element.style.zIndex = ++zCounter;
		return;

		case Constants.DRAGGING_ON_WORKBENCH:
		// Update selectedItem
		selectedItem.lastMousePos = action.mousePos;
		if (!requestId) {
			requestId = requestAnimationFrame(updateFilter);
		}
		return;

		case Constants.END_DRAG_ON_WORKBENCH:
		selectedItem.dragging = false;
		requestId = null;
		return;

		case Constants.START_SELECTION:
		selection.startScrollPos = action.scrollPos;
		selection.currentPos = selection.startPos = action.scrollPos.add(action.mousePos);
		selection.active = true;
		return;

		case Constants.MOVE_SELECTION:
		selection.currentPos = selection.startScrollPos.add(action.mousePos);
		SelectionStore.emitChange();
		return;

		case Constants.END_SELECTION:
		selection.active = false;
		SelectionStore.emitChange();
		return;
	}
});