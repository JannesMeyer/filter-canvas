var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var	SelectionStore = require('./SelectionStore');
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

/**
 * AppActions single object (like a singleton)
 */
var AppActions = {

	createFilter(id, x, y) {
		Dispatcher.dispatch({ actionType: Constants.CREATE_FILTER, id, x, y });
	},

	startDragOnWorkbench(id, element, clientX, clientY) {
		var mousePos = new Point(clientX, clientY);
		Dispatcher.dispatch({ actionType: Constants.START_DRAG_ON_WORKBENCH, id, element, mousePos });
	},

	draggingOnWorkbench(clientX, clientY) {
		var mousePos = new Point(clientX, clientY);
		if (SelectionStore.isDragging()) {
			Dispatcher.dispatch({ actionType: Constants.DRAGGING_ON_WORKBENCH, mousePos });
		} else if (SelectionStore.isSelecting()) {
			Dispatcher.dispatch({ actionType: Constants.MOVE_SELECTION, mousePos });
		}
	},

	endDragOnWorkbench(clientX, clientY) {

		if (SelectionStore.isSelecting()) {
			Dispatcher.dispatch({ actionType: Constants.END_SELECTION });

			var selection = SelectionStore.getSelectionRect();
			if (selection.getDiagonalLength() === 0) {
				// TODO: deselect happens on mousedown
				console.log('Click on workbench background');
				return;
			}
			var selectedFilters = WorkbenchStore.getFiltersCoveredBy(selection);
			console.log('Number of filters selected:', selectedFilters.toArray().length);
		}
		if (!SelectionStore.isDragging()) {
			return;
		}
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH });

		if (SelectionStore.getSelectedItemType() !== 'WFilter') {
			return;
		}

		var mousePos = new Point(clientX, clientY);
		var id = SelectionStore.getSelectedItemId();
		var delta = SelectionStore.getAmountDragged(mousePos);
		if (delta.distanceFromOrigin() === 0) {
			Dispatcher.dispatch({ actionType: Constants.ITEM_CLICKED_ON_WORKBENCH, id });
		} else {
			Dispatcher.dispatch({ actionType: Constants.MOVE_BY_ON_WORKBENCH, id, delta });
		}
	},

	startSelection(scrollLeft, scrollTop, clientX, clientY, button, shiftKey, ctrlKey, altKey, metaKey) {
		// Right clicks shouldn't start a selection
		if (button !== 0 || isMacSystem && ctrlKey) {
			return;
		}

		if (isMacSystem && metaKey || !isMacSystem && ctrlKey) {
			console.log('Extend selection if exists');
		}
		var scrollPos = new Point(scrollLeft, scrollTop);
		var mousePos = new Point(clientX, clientY);
		Dispatcher.dispatch({ actionType: Constants.START_SELECTION, scrollPos, mousePos });
	}
};
module.exports = AppActions;