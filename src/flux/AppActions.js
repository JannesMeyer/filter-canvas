var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var	SelectionStore = require('./SelectionStore');
var EtherMovementStore = require('./EtherMovementStore');
var WorkbenchStore = require('./WorkbenchStore');
var Point = require('../lib/ImmutablePoint');

/**
 * Usually user agent checking is a bad practice. But in this case we're using it to determine
 * which key has to be pressed to trigger multiple selection.
 *
 * On OSX systems the expected behavior is to use metaKey
 * On all other systems the expected behavior is to use ctrlKey
 */
var isMacSystem = !!(typeof navigator !== 'undefined' && navigator.platform && navigator.platform.indexOf('Mac') !== -1);

function getSelectionType(ev) {
	// Only let left-clicks through
	if (ev.button !== 0 || isMacSystem && ev.ctrlKey) {
		return null;
	}

	// Continue with the existing selection if the user is
	// pressing the OS-specific key
	if (isMacSystem && ev.metaKey ||
		 !isMacSystem && ev.ctrlKey) {
		return Constants.SELECTION_TYPE_EXTEND;
	}

	return Constants.SELECTION_TYPE_NEW;
}

/**
 * AppActions single object (like a singleton)
 */
var AppActions = {

	createFilter(id, x, y) {
		Dispatcher.dispatch({ actionType: Constants.CREATE_FILTER, id, x, y });
	},

	startMoveSelectedItems(itemType, itemId, itemElement, event) {
		var selectionType = getSelectionType(event);
		if (selectionType === null) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();

		if (selectionType === Constants.SELECTION_TYPE_NEW) {
			Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
		}

		// Add item to selected items
		Dispatcher.dispatch({
			actionType: Constants.START_MOVING_SELECTED_ITEMS,
			type: itemType,
			id: itemId,
			element: itemElement,
			mousePos: new Point(event.clientX, event.clientY)
		});
	},

	moveSelectedItems(clientX, clientY) {
		Dispatcher.dispatch({
			actionType: Constants.MOVING_SELECTED_ITEMS,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishMovingSelectedItems(event) {
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH });

		var mousePos = new Point(event.clientX, event.clientY);
		var delta = EtherMovementStore.getAmountDragged(mousePos);

		if (delta.isZero()) {
			// TODO: make sure this is correct
			Dispatcher.dispatch({
				actionType: Constants.ITEM_CLICKED_ON_WORKBENCH,
				// items: SelectionStore.getSelectedItems()
			});
		} else {
			Dispatcher.dispatch({
				actionType: Constants.MOVE_SELECTED_ITEMS,
				// items: SelectionStore.getSelectedItems(),
				delta: delta
			});
		}

		event.preventDefault();
		event.stopPropagation();
	},

	startSelection(scrollLeft, scrollTop, event) {
		var selectionType = getSelectionType(event);
		if (!selectionType) {
			return;
		}

		if (selectionType === Constants.SELECTION_TYPE_NEW) {
			Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
		}

		Dispatcher.dispatch({
			actionType: Constants.START_SELECTION,
			scrollPos: new Point(scrollLeft, scrollTop),
			mousePos: new Point(event.clientX, event.clientY)
		});

		event.preventDefault();
		event.stopPropagation();
	},

	resizeSelection(clientX, clientY) {
		Dispatcher.dispatch({
			actionType: Constants.MOVE_SELECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishSelection(event) {
		if (SelectionStore.isClick()) {
			Dispatcher.dispatch({ actionType: Constants.CANCEL_SELECTION });
			Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
		} else {
			Dispatcher.dispatch({ actionType: Constants.FINISH_SELECTION });
		}

		event.preventDefault();
		event.stopPropagation();
	}

};
module.exports = AppActions;