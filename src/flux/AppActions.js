import translate from 'counterpart';
import saveAs from 'browser-saveas';
import Point from '../lib/ImmutablePoint';
import WorkbenchStore from '../stores/WorkbenchStore';
import SelectionStore from '../stores/SelectionStore';
import CreateConnectionStore from '../stores/CreateConnectionStore';
import Dispatcher from './Dispatcher';
import Constants from './Constants';

/**
 * Global AppActions (like a singleton)
 *
 * These functions are not supposed to do much except call out to the global
 * Dispatcher object and dispatch actions which will be received by the Stores.
 *
 * @see WorkbenchStore
 * @see SelectionStore
 * @see RepositoryStore
 * @see CreateConnectionStore
 * @see LanguageStore
 */
export default {

	changeLanguage(language) {
		Dispatcher.dispatch({ actionType: Constants.CHANGE_UI_LANGUAGE, language });
	},

	reloadRepository() {
		Dispatcher.dispatch({ actionType: Constants.RELOAD_REPOSITORY })
	},

	/**
	 * Imports a JSON configuration file
	 * Could throw a SyntaxError
	 */
	importFile(text) {
		Dispatcher.dispatch({ actionType: Constants.IMPORT_FILE, obj: JSON.parse(text) });
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
		saveAs(blob, translate('actions.filename') + '.json');

		// URL.createObjectURL(blob)
	},

	saveSelectedItemsAsFilter() {
		console.log('TODO: save selected items as filter');
	},

	undo() {
		Dispatcher.dispatch({ actionType: Constants.UNDO });
	},

	redo() {
		Dispatcher.dispatch({ actionType: Constants.REDO });
	},

	createItem(type, id, position) {
		Dispatcher.dispatch({ actionType: Constants.CREATE_ITEM, type, id, position });
	},

	setItemInputs(id, numInputs) {
		Dispatcher.dispatch({ actionType: Constants.SET_ITEM_INPUTS, id, numInputs });
	},

	setItemOutputs(id, numOutputs) {
		Dispatcher.dispatch({ actionType: Constants.SET_ITEM_OUTPUTS, id, numOutputs });
	},

	setItemParams(id, params) {
		Dispatcher.dispatch({ actionType: Constants.SET_ITEM_PARAMS, id, params });
	},

	removeItemParam(id, param) {
		Dispatcher.dispatch({ actionType: Constants.REMOVE_ITEM_PARAM, id, param });
	},

	deleteSelectedItems() {
		Dispatcher.dispatch({
			actionType: Constants.DELETE_SELECTED_ITEMS,
			selectedItems: SelectionStore.getSelectedItemIds()
		});
	},

	deleteAllItems() {
		Dispatcher.dispatch({ actionType: Constants.DELETE_ALL_ITEMS });
	},

	startMovingSelectedItems(id, ctrlKey, metaKey, mousePos) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey, id);
		switch(selectionType) {
			case Constants.SELECTION_TYPE_NEW:
				Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
				// Fall through!
			case Constants.SELECTION_TYPE_EXTEND:
				Dispatcher.dispatch({ actionType: Constants.START_MOVING_SELECTED_ITEMS, id, mousePos });
			break;
		}
	},

	moveSelectedItems(mousePos) {
		Dispatcher.dispatch({ actionType: Constants.MOVING_SELECTED_ITEMS, mousePos });
	},

	finishMovingSelectedItems(mousePos) {
		Dispatcher.dispatch({ actionType: Constants.FINISH_MOVING_SELECTED_ITEMS });

		var delta = WorkbenchStore.getAmountDragged(mousePos);

		// Only a click
		if (delta.isZero()) {
			// TODO: should reset the selection to only the clicked item
			return;
		}

		Dispatcher.dispatch({
			actionType: Constants.MOVE_SELECTED_ITEMS_BY,
			selectedItems: SelectionStore.getSelectedItemIds(),
			delta: delta
		});
	},

	startSelection(ctrlKey, metaKey, scrollPos, position) {
		// TODO: protect from double-start
		var selectionType = SelectionStore.getSelectionType(ctrlKey, metaKey);
		switch(selectionType) {

			case Constants.SELECTION_TYPE_NEW:
				Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
				// Fall through!

			case Constants.SELECTION_TYPE_EXTEND:
				Dispatcher.dispatch({ actionType: Constants.START_SELECTION, scrollPos, position });

		}
	},

	resizeSelection(mousePos) {
		Dispatcher.dispatch({ actionType: Constants.RESIZE_SELECTION, mousePos });
	},

	finishSelection() {
		// TODO: use the last x/y values
		if (SelectionStore.isClick()) {
			Dispatcher.dispatch({ actionType: Constants.CANCEL_SELECTION });
		} else {
			Dispatcher.dispatch({ actionType: Constants.FINISH_SELECTION });
		}
	},

	deleteConnection(connector1, connector2) {
		Dispatcher.dispatch({ actionType: Constants.DELETE_CONNECTION, connector1, connector2 });
	},

	startConnection(connector, mousePos) {
		// TODO: protect from double-start
		Dispatcher.dispatch({ actionType: Constants.START_CONNECTION, connector, mousePos });
	},

	resizeConnection(absMousePos) {
		Dispatcher.dispatch({ actionType: Constants.RESIZE_CONNECTION, absMousePos });
	},

	finishConnection(absMousePos) {
		// TODO: use last absMousePos for this check
		if (CreateConnectionStore.isComplete()) {
			var [from, to] = CreateConnectionStore.getAddresses();
			Dispatcher.dispatch({ actionType: Constants.FINISH_CONNECTION, from, to });
		} else {
			Dispatcher.dispatch({ actionType: Constants.CANCEL_CONNECTION });
		}
	},

	selectAll() {
		// TODO: ignore during item drag
		// TODO: ignore during selection drag
		Dispatcher.dispatch({ actionType: Constants.SELECT_ALL });
	},

	cancel() {
		// TODO: cancel item drag
		// TODO: cancel selection drag
		// TODO: clear selected items
		Dispatcher.dispatch({ actionType: Constants.CANCEL_SELECTION });
		Dispatcher.dispatch({ actionType: Constants.CLEAR_SELECTED_ITEMS });
	}

};