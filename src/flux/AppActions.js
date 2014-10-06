var Point = require('../lib/ImmutablePoint');

var WorkbenchStore = require('./WorkbenchStore');
var	SelectionStore = require('./SelectionStore');
var CreateConnectionStore = require('./CreateConnectionStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

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

	startMovingSelectedItems(id, ctrlKey, metaKey, clientX, clientY) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey, id);
		switch(selectionType) {

			case constants.SELECTION_TYPE_NEW:
				dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
				// Fall through!

			case constants.SELECTION_TYPE_EXTEND:
				dispatcher.dispatch({
					actionType: constants.START_MOVING_SELECTED_ITEMS,
					id,
					mousePos: new Point(clientX, clientY)
				});

		}
	},

	moveSelectedItems(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.MOVING_SELECTED_ITEMS,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishMovingSelectedItems(clientX, clientY) {
		dispatcher.dispatch({ actionType: constants.FINISH_MOVING_SELECTED_ITEMS });

		var mousePos = new Point(clientX, clientY);
		var delta = WorkbenchStore.getAmountDragged(mousePos);

		// Only a click
		if (delta.isZero()) {
			// TODO: should reset the selection to only the clicked item
			return;
		}

		dispatcher.dispatch({
			actionType: constants.MOVE_SELECTED_ITEMS_BY,
			selectedItems: SelectionStore.getSelectedItemIds(),
			delta: delta
		});
	},

	startSelection(ctrlKey, metaKey, scrollLeft, scrollTop, clientX, clientY) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey);
		switch(selectionType) {

			case constants.SELECTION_TYPE_NEW:
				dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
				// Fall through!

			case constants.SELECTION_TYPE_EXTEND:
				dispatcher.dispatch({
					actionType: constants.START_SELECTION,
					scrollPos: new Point(scrollLeft, scrollTop),
					mousePos: new Point(clientX, clientY)
				});

		}
	},

	resizeSelection(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.RESIZE_SELECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishSelection() {
		// TODO: use the last x/y values
		if (SelectionStore.isClick()) {
			dispatcher.dispatch({ actionType: constants.CANCEL_SELECTION });
		} else {
			dispatcher.dispatch({ actionType: constants.FINISH_SELECTION });
		}
	},

	deleteConnection(connector1, connector2) {
		dispatcher.dispatch({ actionType: constants.DELETE_CONNECTION, connector1, connector2 });
	},

	startConnection(connector, clientX, clientY) {
		// TODO: protect from double-start
		dispatcher.dispatch({
			actionType: constants.START_CONNECTION,
			connector,
			mousePos: new Point(clientX, clientY)
		});
	},

	resizeConnection(clientX, clientY) {
		dispatcher.dispatch({
			actionType: constants.RESIZE_CONNECTION,
			mousePos: new Point(clientX, clientY)
		});
	},

	finishConnection(clientX, clientY) {
		// TODO: use last clientX and clientY for this check
		if (CreateConnectionStore.isComplete()) {
			var [from, to] = CreateConnectionStore.getAddresses();
			dispatcher.dispatch({ actionType: constants.FINISH_CONNECTION, from, to });
		} else {
			dispatcher.dispatch({ actionType: constants.CANCEL_CONNECTION });
		}
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