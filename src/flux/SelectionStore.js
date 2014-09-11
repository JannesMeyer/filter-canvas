var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');

var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

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
		var key = type + '#' + id;
		// TODO: make the second condition work for all types
		return selectedItems.has(key) || itemsInsideSelection.has(id);
	}
});
module.exports = SelectionStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	// console.log(action.actionType);
	switch(action.actionType) {
		case Constants.START_MOVING_SELECTED_ITEMS:
		if (action.type === Constants.ITEM_TYPE_FILTER) {
			var key = 'Filter#' + action.id;
			var item = WorkbenchStore.getFilter(action.id);
		} else if (action.type === Constants.ITEM_TYPE_PIPE) {
			var key = 'Pipe#' + action.id;
			var item = WorkbenchStore.getPipe(action.id);
		}
		selectedItems = selectedItems.set(key, item);
		SelectionStore.emitChange();
		return;

		case Constants.START_SELECTION:
		startScrollPos = action.scrollPos;
		startPos = lastPos = startScrollPos.add(action.mousePos);
		isSelecting = true;
		return;

		case Constants.MOVE_SELECTION:
		lastPos = startScrollPos.add(action.mousePos);

		// Update items inside selection
		var selectionRect = SelectionStore.getSelectionRect();
		itemsInsideSelection = WorkbenchStore.getFiltersCoveredBy(selectionRect).toMap();
		SelectionStore.emitChange();
		return;

		case Constants.FINISH_SELECTION:
		// Transfer itemsInsideSelection to selectedItems
		selectedItems = selectedItems.withMutations(selectedItems => {
			itemsInsideSelection.forEach((item, id) => {
				var key = 'Filter#' + id;
				selectedItems = selectedItems.set(key, item);
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