var { Set } = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore; // late import
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var selectedItems = Set();
var itemsInsideSelection = Set();
var isSelecting = false;
var startScrollPos;
var startPos;
var lastPos;

/**
 * We're using this information to determine which key has to be pressed
 * to trigger multiple selection.
 *
 * On OSX systems the expected behavior is to use metaKey
 * On all other systems the expected behavior is to use ctrlKey
 */
var isMacPlatform = Boolean(typeof navigator !== 'undefined' && navigator.platform && navigator.platform.indexOf('Mac') !== -1);

// TODO: Improve every (ev.button !== 0) check in the codebase with this
// if (ev.button !== 0 || isMacPlatform && ev.ctrlKey) {
// 	return;
// }

/**
 * SelectionStore single object
 * (like a singleton)
 */
var SelectionStore = BaseStore.createEventEmitter(['change'], {

	/**
	 * Helper-function to determine what kind of action should happen
	 */
	getSelectionType(ctrlKey, metaKey, itemId) {
		// Continue with the existing selection if the user is
		// pressing the platform-specific key for continuing a selection
		if (!isMacPlatform && ctrlKey ||
		     isMacPlatform && metaKey) {
			return constants.SELECTION_TYPE_EXTEND;
		}

		// Keep the existing selection if the user is
		// going to drag a part of it
		if (this.isItemSelected(itemId)) {
			return constants.SELECTION_TYPE_EXTEND;
		}

		return constants.SELECTION_TYPE_NEW;
	},

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
		return selectedItems.contains(id) || itemsInsideSelection.contains(id);
	},

	getSelectedItemIds() {
		// TODO: don't recalculate this union everytime
		return selectedItems.union(itemsInsideSelection);
	}

});

SelectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.START_MOVING_SELECTED_ITEMS:
			selectedItems = selectedItems.add(action.id);
			SelectionStore.emitChange();
		break;

		case constants.START_SELECTION:
			// TODO: don't save scrollpos
			startScrollPos = action.scrollPos;
			startPos = lastPos = action.position;
			isSelecting = true;
		break;

		case constants.RESIZE_SELECTION:
			// Find itemsInsideSelection
			lastPos = startScrollPos.add(action.mousePos);
			var rect = SelectionStore.getSelectionRect();
			itemsInsideSelection = WorkbenchStore.getItemsCoveredBy(rect);
			SelectionStore.emitChange();
		break;

		case constants.FINISH_SELECTION:
			// Transfer itemsInsideSelection
			selectedItems = selectedItems.union(itemsInsideSelection);
			itemsInsideSelection = Set();
			isSelecting = false;
			SelectionStore.emitChange();
		break;

		// TODO: emitChange, because it could be cancelled for other reason than just no movement
		case constants.CANCEL_SELECTION:
			itemsInsideSelection = Set();
			isSelecting = false;
		break;

		case constants.CLEAR_SELECTED_ITEMS:
		case constants.DELETE_SELECTED_ITEMS:
		case constants.DELETE_ALL_ITEMS:
		case constants.IMPORT_FILE:
			if (selectedItems.length > 0) {
				selectedItems = selectedItems.clear();
				SelectionStore.emitChange();
			}
		break;

		case constants.CREATE_ITEM:
			// Select the item after the it was created
			dispatcher.waitFor([ WorkbenchStore.dispatchToken ]);
			selectedItems = Set(WorkbenchStore.getLastIndex());
			SelectionStore.emitChange();
		break;

		case constants.SELECT_ALL:
			selectedItems = WorkbenchStore.getAllItems().keySeq().toSet();
			SelectionStore.emitChange();
		break;
	}
});

module.exports = SelectionStore;

// Requiring after the export prevents problems with circular dependencies
WorkbenchStore = require('./WorkbenchStore')