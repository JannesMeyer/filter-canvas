var immutable = require('immutable');
var Rect = require('../lib/ImmutableRect');
var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');

// Data
var selectedItems = immutable.Set();

var isSelecting = false;
var startScrollPos;
var startPos;
var lastPos;
var itemsInsideSelection = immutable.Vector();

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
	}
});
module.exports = SelectionStore;

// Register for all actions with the Dispatcher
Dispatcher.register(function(action) {
	switch(action.actionType) {

		case Constants.START_MOVING_SELECTED_ITEMS:
		if (action.type === Constants.ITEM_TYPE_FILTER) {
			var item = WorkbenchStore.getFilter(action.id);
			// TODO: do this differently
			item.hashCode = function() {
				return 'Filter#' + action.id;
			};
			selectedItems = selectedItems.add(item);
			return;
		}
		if (action.type === Constants.ITEM_TYPE_PIPE) {
			var item = WorkbenchStore.getPipe(action.id);
			selectedItems = selectedItems.add(item);
			return;
		}
		return;

		case Constants.START_SELECTION:
		startScrollPos = action.scrollPos;
		lastPos = startPos = startScrollPos.add(action.mousePos);
		isSelecting = true;
		return;

		case Constants.MOVE_SELECTION:
		lastPos = startScrollPos.add(action.mousePos);
		// TODO: update itemsInsideSelection
		SelectionStore.emitChange();
		return;

		case Constants.FINISH_SELECTION:
		isSelecting = false;
		SelectionStore.emitChange();
		return;

		case Constants.CLEAR_SELECTED_ITEMS:
		selectedItems = selectedItems.clear();
		SelectionStore.emitChange();
		return;
	}
});