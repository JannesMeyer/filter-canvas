var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var	SelectionStore = require('./SelectionStore');
var EtherMovementStore = require('./EtherMovementStore');
var Point = require('../lib/ImmutablePoint');

/**
 * Usually user agent checking is a bad practice. But in this case we're using it to determine
 * which key has to be pressed to trigger multiple selection.
 *
 * On OSX systems the expected behavior is to use metaKey
 * On all other systems the expected behavior is to use ctrlKey
 */
var isMacSystem = !!(typeof navigator !== 'undefined' && navigator.platform && navigator.platform.indexOf('Mac') !== -1);

function getSelectionType(ev, isItemSelected) {
	// Only let left-clicks through
	if (ev.button !== 0 || isMacSystem && ev.ctrlKey) {
		return null;
	}

	// Keep the existing selection if the user is
	// going to drag a part of it
	if (isItemSelected) {
		return Constants.SELECTION_TYPE_EXTEND;
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

	startMovingSelectedItems(type, id, element, event) {
		var isItemSelected = SelectionStore.isItemSelected(type, id);

		var selectionType = getSelectionType(event, isItemSelected);
		if (selectionType === null) {
			return;
		}
		if (selectionType === Constants.SELECTION_TYPE_NEW) {
			Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
		}

		Dispatcher.dispatch({
			actionType: Constants.START_MOVING_SELECTED_ITEMS,
			mousePos: new Point(event.clientX, event.clientY),
			type, id, element
		});

		event.preventDefault();
		event.stopPropagation();
	},

	moveSelectedItems(clientX, clientY) {
		Dispatcher.dispatch({
			actionType: Constants.MOVING_SELECTED_ITEMS,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishMovingSelectedItems(event) {
		Dispatcher.dispatch({ actionType: Constants.FINISH_MOVING_SELECTED_ITEMS });

		var mousePos = new Point(event.clientX, event.clientY);
		var delta = EtherMovementStore.getAmountDragged(mousePos);

		if (delta.isZero()) {
			// TODO: make sure this is correct
			Dispatcher.dispatch({
				actionType: Constants.ITEM_CLICKED,
				// items: SelectionStore.getSelectedItems()
			});
		} else {
			Dispatcher.dispatch({
				actionType: Constants.MOVE_SELECTED_ITEMS_BY,
				selectedItems: SelectionStore.getSelectedItems(),
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
			actionType: Constants.RESIZE_SELECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishSelection(event) {
		if (SelectionStore.isClick()) {
			Dispatcher.dispatch({ actionType: Constants.CANCEL_SELECTION });
		} else {
			Dispatcher.dispatch({ actionType: Constants.FINISH_SELECTION });
		}

		event.preventDefault();
		event.stopPropagation();
	}

};
module.exports = AppActions;