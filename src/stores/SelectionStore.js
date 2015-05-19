import { Set } from 'immutable';
import Rect from '../lib/ImmutableRect';
import { createEventEmitter } from '../lib/BaseStore';
import WorkbenchStore from './WorkbenchStore';
import Dispatcher from '../flux/Dispatcher';
import Constants from '../flux/Constants';

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
var SelectionStore = createEventEmitter(['change'], {

	/**
	 * Helper-function to determine what kind of action should happen
	 */
	getSelectionType(ctrlKey, metaKey, itemId) {
		// Continue with the existing selection if the user is
		// pressing the platform-specific key for continuing a selection
		if (!isMacPlatform && ctrlKey ||
		     isMacPlatform && metaKey) {
			return Constants.SELECTION_TYPE_EXTEND;
		}

		// Keep the existing selection if the user is
		// going to drag a part of it
		if (this.isItemSelected(itemId)) {
			return Constants.SELECTION_TYPE_EXTEND;
		}

		return Constants.SELECTION_TYPE_NEW;
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

SelectionStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
			selectedItems = selectedItems.add(action.id);
			SelectionStore.emitChange();
		break;

		case Constants.START_SELECTION:
			// TODO: don't save scrollpos
			startScrollPos = action.scrollPos;
			startPos = lastPos = action.position;
			isSelecting = true;
		break;

		case Constants.RESIZE_SELECTION:
			// Find itemsInsideSelection
			lastPos = startScrollPos.add(action.mousePos);
			var rect = SelectionStore.getSelectionRect();
			itemsInsideSelection = WorkbenchStore.getItemsCoveredBy(rect).toSet();
			SelectionStore.emitChange();
		break;

		case Constants.FINISH_SELECTION:
			// Commit itemsInsideSelection to the Store
			selectedItems = selectedItems.union(itemsInsideSelection);
			itemsInsideSelection = Set();
			isSelecting = false;
			SelectionStore.emitChange();
		break;

		// TODO: emitChange, because it could be cancelled for other reason than just no movement
		case Constants.CANCEL_SELECTION:
			itemsInsideSelection = Set();
			isSelecting = false;
		break;

		case Constants.CLEAR_SELECTED_ITEMS:
		case Constants.DELETE_SELECTED_ITEMS:
		case Constants.DELETE_ALL_ITEMS:
		case Constants.IMPORT_FILE:
			if (selectedItems.length > 0) {
				selectedItems = selectedItems.clear();
				SelectionStore.emitChange();
			}
		break;

		case Constants.UNDO:
		case Constants.REDO:
			// Remove items from the selection that are gone after the undo/redo
			selectedItems = selectedItems.intersect(WorkbenchStore.getAllItemIds());
		break;

		case Constants.CREATE_ITEM:
			// Select the item after it was created
			Dispatcher.waitFor([ WorkbenchStore.dispatchToken ]);
			selectedItems = Set(WorkbenchStore.getLastIndex());
			SelectionStore.emitChange();
		break;

		case Constants.SELECT_ALL:
			selectedItems = WorkbenchStore.getAllItemIds().toSet();
			SelectionStore.emitChange();
		break;
	}
});

export default SelectionStore;