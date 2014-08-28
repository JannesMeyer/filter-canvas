var immutable = require('immutable');
var EventEmitter = require('events').EventEmitter;
var merge = require('react/lib/merge');

var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

var Store = merge(EventEmitter.prototype, {
	CHANGE_EVENT: 'change',
	DRAG_EVENT: 'drag',
	getFilter(id) {
		return filters.get(id);
	},
	getAllFilters() {
		return filters;
	},
	getDragItem() {
		return dragItem;
	},
	isNotDragging() {
		return !dragItem.filter;
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

var zCounter = 0;
var spacing = 70;
var filters = immutable.fromJS([
	{
		class: 'SourceFilterExample',
		x: 20,
		y: 20 + 0 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 1 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 2 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 3 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 4 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 5 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 6 * spacing
	},
	{
		class: 'WorkFilterExample',
		x: 20,
		y: 20 + 7 * spacing
	},
	{
		class: 'EndFilterExample',
		x: 20,
		y: 20 + 8 * spacing
	}
]);
// This information is very transient
var dragItem = {};

function setDragItem(sourceObj) {
	dragItem.id = sourceObj.id;
	dragItem.filter = filters.get(sourceObj.id);
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
	console.log(action.actionType);

	switch(action.actionType) {
	case Constants.START_DRAG_ON_WORKBENCH:
		setDragItem(action);
		// TODO: do this smarter
		dragItem.element.style.zIndex = ++zCounter;
		dragItem.element.classList.add('active');
		Store.emit(Store.DRAG_EVENT);
	return;

	case Constants.DRAGGING_ON_WORKBENCH:
		var {x, y} = Store.getAmountDragged(action.clientX, action.clientY);
		x += dragItem.filter.get('x');
		y += dragItem.filter.get('y');
		dragItem.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
	return;

	case Constants.END_DRAG_ON_WORKBENCH:
		dragItem.element.classList.remove('active');
	return;

	case Constants.MOVE_BY_ON_WORKBENCH:
		var x = action.x + dragItem.filter.get('x');
		var y = action.y + dragItem.filter.get('y');
		moveFilterTo(dragItem.id, x, y);
		dragItem = {};
		Store.emit(Store.CHANGE_EVENT);
	return;

	case Constants.ITEM_CLICKED_ON_WORKBENCH:
		console.log('clicked: ' + dragItem.id);
		dragItem = {};
		Store.emit(Store.CHANGE_EVENT);
	return;
	}
});