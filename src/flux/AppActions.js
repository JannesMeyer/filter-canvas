var Point = require('../lib/ImmutablePoint');

var WorkbenchStore = require('./WorkbenchStore');
var EtherMovementStore = require('./EtherMovementStore');
var	SelectionStore = require('./SelectionStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// TODO: move this to `lib/mouse-tool.js` or something like that
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
		return constants.SELECTION_TYPE_EXTEND;
	}

	// Continue with the existing selection if the user is
	// pressing the OS-specific key
	if (isMacSystem && ev.metaKey ||
		 !isMacSystem && ev.ctrlKey) {
		return constants.SELECTION_TYPE_EXTEND;
	}

	return constants.SELECTION_TYPE_NEW;
}

/**
 * AppActions single object (like a singleton)
 */
var AppActions = {

	importFile(contents) {
		console.log('TODO: import file');
	},

	exportFile() {
		console.log('TODO: export file');
	},

	saveSelectedItemsAsFilter() {
		console.log('TODO: save selected items as filter');
	},

	undo() {
		dispatcher.dispatch({ actionType: constants.UNDO });
	},

	redo() {
		dispatcher.dispatch({ actionType: constants.REDO });
	},

	createItem(type, id, x, y) {
		dispatcher.dispatch({ actionType: constants.CREATE_ITEM, type, id, x, y });
	},

	updateItemParams(id, params) {
		// TODO
	},

	deleteSelectedItems() {
		dispatcher.dispatch({
			actionType: constants.DELETE_SELECTED_ITEMS,
			selectedItems: SelectionStore.getSelectedItemIds()
		});
	},

	startMovingSelectedItems(id, event) {
		var selected = SelectionStore.isItemSelected(id);
		var selectionType = getSelectionType(event, selected);
		if (selectionType === null) {
			return;
		}
		if (selectionType === constants.SELECTION_TYPE_NEW) {
			dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
		}

		dispatcher.dispatch({
			actionType: constants.START_MOVING_SELECTED_ITEMS,
			id,
			mousePos: new Point(event.clientX, event.clientY)
		});

		event.preventDefault();
		event.stopPropagation();
	},

	moveSelectedItems(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.MOVING_SELECTED_ITEMS,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishMovingSelectedItems(event) {
		dispatcher.dispatch({ actionType: constants.FINISH_MOVING_SELECTED_ITEMS });

		var mousePos = new Point(event.clientX, event.clientY);
		var delta = EtherMovementStore.getAmountDragged(mousePos);

		// Only a click
		if (delta.isZero()) {
			return;
		}

		dispatcher.dispatch({
			actionType: constants.MOVE_SELECTED_ITEMS_BY,
			selectedItems: SelectionStore.getSelectedItemIds(),
			delta: delta
		});

		event.preventDefault();
		event.stopPropagation();
	},

	startSelection(scrollLeft, scrollTop, event) {
		var selectionType = getSelectionType(event);
		if (!selectionType) {
			return;
		}

		if (selectionType === constants.SELECTION_TYPE_NEW) {
			dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
		}

		dispatcher.dispatch({
			actionType: constants.START_SELECTION,
			scrollPos: new Point(scrollLeft, scrollTop),
			mousePos: new Point(event.clientX, event.clientY)
		});

		event.preventDefault();
		event.stopPropagation();
	},

	resizeSelection(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.RESIZE_SELECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishSelection(event) {
		if (SelectionStore.isClick()) {
			dispatcher.dispatch({ actionType: constants.CANCEL_SELECTION });
		} else {
			dispatcher.dispatch({ actionType: constants.FINISH_SELECTION });
		}

		event.preventDefault();
		event.stopPropagation();
	},

	startConnection(connector, clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.START_CONNECTION,
			// scrollPos: new Point(scrollLeft, scrollRight),
			mousePos: new Point(clientX, clientY),
			connector
		});
	},

	resizeConnection(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.RESIZE_CONNECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishConnection(event) {

	FINISH_CONNECTION
	CANCEL_CONNECTION

		event.preventDefault();
		event.stopPropagation();
	},

	selectAll() {
		// TODO: ignore during item drag
		// TODO: ignore during selection drag
		dispatcher.dispatch({ actionType: constants.SELECT_ALL });
	},

	cancel() {
		// TODO: cancel item drag
		// TODO: cancel selection drag
		// TODO: clear selected items
		dispatcher.dispatch({ actionType: constants.CANCEL_SELECTION });
		dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
	}

};
module.exports = AppActions;