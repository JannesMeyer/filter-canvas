var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var wires = [
	immutable.fromJS({
		fromPoint: [258, 210],
		toPoint: [600, 600]
	})
];

var Store = merge(EventEmitter.prototype, {
	CHANGE_EVENT: 'change',
	DRAG_EVENT: 'drag',
	getFilter(id) {
		return filters.get(id);
	},
	getAllFilters() {
		return filters;
	},
	getWire(id) {
		return wires[id];
	},
	getWireWidth() {
		return 4;
	},
	getDragItem() {
		return dragItem;
	},
	isNotDragging() {
		return !dragItem.dragging;
	},
	getAmountDragged(clientX, clientY) {
		return {
			x: clientX - dragItem.clientX,
			y: clientY - dragItem.clientY
		};
	}
	// Store.emit(Store.CHANGE_EVENT)
	// Store.on(Store.CHANGE_EVENT, callback)
	// Store.removeListener(Store.CHANGE_EVENT, callback)
});
module.exports = Store;

var zCounter = 10;
var spacing = 70;
var filters = immutable.fromJS([
	{
		class: 'SourceFilterExample',
		inputs: [],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 0 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ 2 ],
		height: 60,
		x: 20,
		y: 20 + 1 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ 1 ],
		outputs: [ null ],
		height: 60,
		x: 400,
		y: 200
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 3 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 4 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 5 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 6 * spacing
	},
	{
		class: 'WorkFilterExample',
		inputs: [ null ],
		outputs: [ null ],
		height: 60,
		x: 20,
		y: 20 + 7 * spacing
	},
	{
		class: 'EndFilterExample',
		inputs: [ null ],
		outputs: [],
		height: 60,
		x: 20,
		y: 20 + 8 * spacing
	}
]);
// This information is very transient
var dragItem = {};

function setDragItem(sourceObj) {
	dragItem.id = sourceObj.id;
	dragItem.element = sourceObj.element;
	dragItem.clientX = sourceObj.clientX;
	dragItem.clientY = sourceObj.clientY;
}

function moveFilterTo(id, x, y) {
	filters = filters.withMutations(filters => {
		filters.updateIn([id, 'x'], () => x);
		filters.updateIn([id, 'y'], () => y);
	});
}

// Register for all actions
Dispatcher.register(function(action) {
	switch(action.actionType) {
	case Constants.START_DRAG_ON_WORKBENCH:
		setDragItem(action);
		dragItem.filter = filters.get(dragItem.id);
		dragItem.dragging = true;

		// TODO: do this smarter
		dragItem.element.focus();
		dragItem.element.style.zIndex = ++zCounter;
		dragItem.element.classList.add('active');
		Store.emit(Store.DRAG_EVENT);
	return;

	case Constants.DRAGGING_ON_WORKBENCH:
		var {x, y} = Store.getAmountDragged(action.clientX, action.clientY);
		x += dragItem.filter.get('x');
		y += dragItem.filter.get('y');
		// dragItem.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
		dragItem.element.style.left = x + 'px';
		dragItem.element.style.top = y + 'px';
	return;

	case Constants.END_DRAG_ON_WORKBENCH:
		dragItem.element.classList.remove('active');
		dragItem.dragging = false;
	return;

	case Constants.MOVE_BY_ON_WORKBENCH:
		var x = action.x + dragItem.filter.get('x');
		var y = action.y + dragItem.filter.get('y');
		moveFilterTo(dragItem.id, x, y);

		Store.emit(Store.CHANGE_EVENT);
	return;

	case Constants.ITEM_CLICKED_ON_WORKBENCH:
		console.log('clicked: ' + dragItem.id);

		Store.emit(Store.CHANGE_EVENT);
	return;
	}
});