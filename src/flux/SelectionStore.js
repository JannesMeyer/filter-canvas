var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var selectedItems = immutable.Map();
var itemsInsideSelection = immutable.Map();

var isSelecting = false;
var startScrollPos;
var startPos;
var lastPos;

/**
 * SelectionStore single object
 */
var SelectionStore = BaseStore.createStore({
	getSelectionRect() {
		return Rect.fromTwoPoints(startPos, lastPos);
	},
	isClick() {
		return startPos.equals(lastPos);
	},
	isSelecting() {
		return isSelecting;
	},
	isItemSelected(type, id) {
		// var key = type + '#' + id;
		// TODO: make it work with pipes as well
		return selectedItems.has(id) || itemsInsideSelection.has(id);
	},
	getSelectedItems() {
		return selectedItems;
	}
});
module.exports = SelectionStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
		if (action.type === Constants.ITEM_TYPE_FILTER) {
			// var key = 'Filter#' + action.id;
			var item = WorkbenchStore.getFilter(action.id);
		} else if (action.type === Constants.ITEM_TYPE_PIPE) {
			// var key = 'Pipe#' + action.id;
			var item = WorkbenchStore.getPipe(action.id);
		} else {
			throw new Error('Unknown item type');
		}
		// TODO: make it work with pipes as well
		selectedItems = selectedItems.set(action.id, item);
		SelectionStore.emitChange();
		return;

		case Constants.START_SELECTION:
		startScrollPos = action.scrollPos;
		startPos = lastPos = startScrollPos.add(action.mousePos);
		isSelecting = true;
		return;

		case Constants.RESIZE_SELECTION:
		lastPos = startScrollPos.add(action.mousePos);
		// Update items inside selection
		var selectionRect = SelectionStore.getSelectionRect();
		itemsInsideSelection = WorkbenchStore.getFiltersCoveredBy(selectionRect).toMap();
		SelectionStore.emitChange();
		return;

		case Constants.FINISH_SELECTION:
		// TODO: store references instead of copies
		// Transfer itemsInsideSelection to selectedItems
		selectedItems = selectedItems.withMutations(selectedItems => {
			itemsInsideSelection.forEach((item, id) => {
				// TODO: make it work with pipes as well
				// var key = 'Filter#' + id;
				selectedItems = selectedItems.set(id, item);
			});
			return selectedItems;
		});
		itemsInsideSelection = immutable.Map();
		isSelecting = false;
		SelectionStore.emitChange();
		return;

		case Constants.CANCEL_SELECTION:
		isSelecting = false;
		return;

		case Constants.CLEAR_SELECTED_ITEMS:
		selectedItems = selectedItems.clear();
		SelectionStore.emitChange();
		return;
	}
});