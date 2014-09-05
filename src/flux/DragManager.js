var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame;

// Data
var wires = {};
var selectedItem = { dragging: false };
var zCounter = 10;
var requestId;

function handleDragStart(action) {
	var filter = WorkbenchStore.getFilter(action.id);
	selectedItem = {
		type: 'WFilter',
		id: action.id,
		element: action.element,
		clientX: action.clientX,
		clientY: action.clientY,
		dragging: true,
		currentX: filter.get('x'),
		currentY: filter.get('y'),
		connections: filter.get('connections')
	};

	// Update filter
	action.element.focus();
	action.element.style.zIndex = ++zCounter;
}

function handleDragMove(action) {
	selectedItem.deltaX = action.clientX - selectedItem.clientX;
	selectedItem.deltaY = action.clientY - selectedItem.clientY;

	if (!requestId) {
		requestId = requestAnimationFrame(updateFilter);
	}
}

function updateFilter() {
	var x = selectedItem.currentX + selectedItem.deltaX;
	var y = selectedItem.currentY + selectedItem.deltaY;

	// Re-draw wires
	selectedItem.connections.forEach(id => {
		// Mutate the connection data
		var cnx = WorkbenchStore.getConnection(id);
		if (selectedItem.id === cnx.fromFilter) {
			cnx.fromPoint = addToPoint(cnx.fromOffset, x, y);
		}
		if (selectedItem.id === cnx.toFilter) {
			cnx.toPoint = addToPoint(cnx.toOffset, x, y);
		}

		wires[id].forceUpdate();
	});

	// Re-draw filter position
	selectedItem.element.style.left = x + 'px';
	selectedItem.element.style.top = y + 'px';

	// Reset
	requestId = null;
}

function addToPoint(p, a, b) {
	return [p[0] + a, p[1] + b];
}

function handleDragEnd() {
	selectedItem.dragging = false;
	requestId = null;
}

/**
 * DragManager single object
 */
var DragManager = {
	getAmountDragged(clientX, clientY) {
		var x = clientX - selectedItem.clientX;
		var y = clientY - selectedItem.clientY;
		return {x, y};
	},
	getSelectedItemId() {
		return selectedItem.id;
	},
	getSelectedItemType() {
		return selectedItem.type;
	},
	isDragging() {
		return !!selectedItem.dragging;
	},
	registerWire(id, wire) {
		wires[id] = wire;
	},
	unregisterWire(id) {
		delete wires[id];
	}
};
module.exports = DragManager;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_DRAG_ON_WORKBENCH:
		handleDragStart(action);
		return;

		case Constants.DRAGGING_ON_WORKBENCH:
		handleDragMove(action);
		return;

		case Constants.END_DRAG_ON_WORKBENCH:
		handleDragEnd();
		return;
	}
});