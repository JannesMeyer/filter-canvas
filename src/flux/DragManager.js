var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var requestAnimationFrame = window.requestAnimationFrame ||
                            window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame ||
                            window.oRequestAnimationFrame;

// Data
var wires = {};
var zCounter = 10;
var activeItem = { dragging: false };
var requestId;

function handleDragStart(action) {
	var filter = WorkbenchStore.getFilter(action.id);

	activeItem = {
		id: action.id,
		x: filter.get('x'),
		y: filter.get('y'),
		connections: filter.get('connections'),
		element: action.element,
		clientX: action.clientX,
		clientY: action.clientY,
		dragging: true
	};

	// Update filter
	action.element.focus();
	// action.element.style.zIndex = ++zCounter;
}

function handleDragMove(action) {
	activeItem.deltaX = action.clientX - activeItem.clientX;
	activeItem.deltaY = action.clientY - activeItem.clientY;

	if (!requestId) {
		requestId = requestAnimationFrame(update);
	}
}

function update(time) {
	var x = activeItem.x + activeItem.deltaX;
	var y = activeItem.y + activeItem.deltaY;

	// Re-draw wires
	activeItem.connections.forEach(id => {
		// Mutate the connection data
		var cnx = WorkbenchStore.getConnection(id);
		if (activeItem.id === cnx.fromFilter) {
			cnx.fromPoint = addToPoint(cnx.fromOffset, x, y);
		}
		if (activeItem.id === cnx.toFilter) {
			cnx.toPoint = addToPoint(cnx.toOffset, x, y);
		}

		wires[id].forceUpdate();
	});

	// Re-draw filter position
	activeItem.element.style.left = x + 'px';
	activeItem.element.style.top = y + 'px';

	// Reset requestId
	requestId = null;
}

function addToPoint(p, a, b) {
	return [p[0] + a, p[1] + b];
}

/**
 * DragManager single object
 */
var DragManager = {
	getAmountDragged(clientX, clientY) {
		var x = clientX - activeItem.clientX;
		var y = clientY - activeItem.clientY;
		return {x, y};
	},
	getDragItemId() {
		return activeItem.id;
	},
	isDragging() {
		return !!activeItem.dragging;
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
		activeItem.dragging = false;
		return;
	}
});