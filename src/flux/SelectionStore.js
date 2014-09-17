var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./dispatcher');
var Constants = require('./constants');

// Data
var selectedItems = immutable.Set();
var itemsInsideSelection = immutable.Set();

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
	isItemSelected(id) {
		// TODO: remove type and make ids unique
		return selectedItems.contains(id) || itemsInsideSelection.contains(id);
	},
	getSelectedItemIds() {
		// TODO: don't recalculate this union everytime
		return selectedItems.union(itemsInsideSelection);
	}
});
module.exports = SelectionStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
			if (action.type !== Constants.ITEM_TYPE_FILTER) {
				throw new Error('Unknown item type');
			}
			selectedItems = selectedItems.add(action.id);
			SelectionStore.emitChange();
		return;

		case Constants.START_SELECTION:
			startScrollPos = action.scrollPos;
			startPos = lastPos = startScrollPos.add(action.mousePos);
			isSelecting = true;
		return;

		case Constants.RESIZE_SELECTION:
			// Find itemsInsideSelection
			lastPos = startScrollPos.add(action.mousePos);
			var rect = SelectionStore.getSelectionRect();
			itemsInsideSelection = WorkbenchStore.getItemsCoveredBy(rect).keys().toSet();
			SelectionStore.emitChange();
		return;

		case Constants.FINISH_SELECTION:
			// Transfer itemsInsideSelection
			selectedItems = selectedItems.union(itemsInsideSelection);
			itemsInsideSelection = itemsInsideSelection.clear();
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

		case Constants.CREATE_FILTER:
			// TODO: waitFor WorkbenchStore and then select the latest id
		return;

		case Constants.SELECT_ALL:
			selectedItems = WorkbenchStore.getAllItems().keys().toSet();
			SelectionStore.emitChange();
		return;
	}
});