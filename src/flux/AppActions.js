var saveAs = require('browser-saveas');
var Point = require('../lib/ImmutablePoint');

var WorkbenchStore = require('../stores/WorkbenchStore');
var	SelectionStore = require('../stores/SelectionStore');
var CreateConnectionStore = require('../stores/CreateConnectionStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

/**
 * AppActions single object
 * (like a singleton)
 */
var AppActions = {

	/**
	 * Imports a JSON configuration file
	 * Could throw a SyntaxError
	 */
	importFile(text) {
		dispatcher.dispatch({ actionType: constants.IMPORT_FILE, obj: JSON.parse(text) });
	},

	/**
	 * This action triggers a direct download. It doesn't have any effect
	 * on the user interface inside the DOM.
	 */
	exportFile() {
		// TODO: check for unconnected connectors and warn the user that the configuration is incomplete
		var text = JSON.stringify(WorkbenchStore.export());

		if (!saveAs || typeof Blob === 'undefined') {
			prompt(
				'Ihr Browser unterstützt leider keine HTML5-Downloads.\n\n'+
				'Hier ist der Inhalt, der in die Datei gespeichert worden wäre:',
				text
			);
			return;
		}

		// Generate blob
		// Browser compatiblity:
		// https://developer.mozilla.org/en/docs/Web/API/Blob
		var blob = new Blob([text], { type: 'application/json;charset=utf-8' });

		// Download the generated file (has issues in Safari)
		// Browser compatibility:
		// https://github.com/eligrey/FileSaver.js
		saveAs(blob, 'Konfiguration.json');

		// URL.createObjectURL(blob)
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

	createItem(type, id, position) {
		dispatcher.dispatch({ actionType: constants.CREATE_ITEM, type, id, position });
	},

	setItemParams(id, params) {
		dispatcher.dispatch({ actionType: constants.SET_ITEM_PARAMS, id, params });
	},

	removeItemParam(id, param) {
		dispatcher.dispatch({ actionType: constants.REMOVE_ITEM_PARAM, id, param });
	},

	deleteSelectedItems() {
		dispatcher.dispatch({
			actionType: constants.DELETE_SELECTED_ITEMS,
			selectedItems: SelectionStore.getSelectedItemIds()
		});
	},

	deleteAllItems() {
		dispatcher.dispatch({ actionType: constants.DELETE_ALL_ITEMS });
	},

	startMovingSelectedItems(id, ctrlKey, metaKey, mousePos) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey, id);
		switch(selectionType) {
			case constants.SELECTION_TYPE_NEW:
				dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
				// Fall through!
			case constants.SELECTION_TYPE_EXTEND:
				dispatcher.dispatch({ actionType: constants.START_MOVING_SELECTED_ITEMS, id, mousePos });
			break;
		}
	},

	moveSelectedItems(mousePos) {
		dispatcher.dispatch({ actionType: constants.MOVING_SELECTED_ITEMS, mousePos });
	},

	finishMovingSelectedItems(mousePos) {
		dispatcher.dispatch({ actionType: constants.FINISH_MOVING_SELECTED_ITEMS });

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

	startSelection(ctrlKey, metaKey, scrollPos, position) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey);
		switch(selectionType) {

			case constants.SELECTION_TYPE_NEW:
				dispatcher.dispatch({ actionType: constants.CLEAR_SELECTED_ITEMS });
				// Fall through!

			case constants.SELECTION_TYPE_EXTEND:
				dispatcher.dispatch({ actionType: constants.START_SELECTION, scrollPos, position });

		}
	},

	resizeSelection(mousePos) {
		dispatcher.dispatch({ actionType: constants.RESIZE_SELECTION, mousePos });
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

	startConnection(connector, mousePos) {
		// TODO: protect from double-start
		dispatcher.dispatch({ actionType: constants.START_CONNECTION, connector, mousePos });
	},

	resizeConnection(absMousePos) {
		dispatcher.dispatch({ actionType: constants.RESIZE_CONNECTION, absMousePos });
	},

	finishConnection(absMousePos) {
		// TODO: use last absMousePos for this check
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