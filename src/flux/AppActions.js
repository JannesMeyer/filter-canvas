var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var	SelectionStore = require('./SelectionStore');
var WorkbenchStore = require('./WorkbenchStore');

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
		Dispatcher.dispatch({ actionType: Constants.START_DRAG_ON_WORKBENCH, id, element, clientX, clientY });
	},
	draggingOnWorkbench(clientX, clientY) {
		if (SelectionStore.isDragging()) {
			Dispatcher.dispatch({ actionType: Constants.DRAGGING_ON_WORKBENCH, clientX, clientY });
		} else if (SelectionStore.isSelecting()) {
			Dispatcher.dispatch({ actionType: Constants.MOVE_SELECTION, clientX, clientY });
		}
	},
	endDragOnWorkbench(clientX, clientY) {
		if (SelectionStore.isSelecting()) {
			var selection = SelectionStore.getSelectionRect();
			Dispatcher.dispatch({ actionType: Constants.END_SELECTION, selection });

			if (selection.getDiagonalLength() === 0) {
				// TODO: deselect happens on mousedown
				console.log('Click');
				return;
			}

			var selectedFilters = WorkbenchStore.getFiltersCoveredBy(selection);
			console.log(selectedFilters.toArray().length);
		}
		if (!SelectionStore.isDragging()) {
			return;
		}
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH });

		if (SelectionStore.getSelectedItemType() !== 'WFilter') {
			return;
		}

		var id = SelectionStore.getSelectedItemId();
		var {x, y} = SelectionStore.getAmountDragged(clientX, clientY);

		var distance = Math.sqrt(x * x + y * y);
		if (distance < 1) {
			Dispatcher.dispatch({ actionType: Constants.ITEM_CLICKED_ON_WORKBENCH, id });
		} else {
			Dispatcher.dispatch({ actionType: Constants.MOVE_BY_ON_WORKBENCH, id, x, y });
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
		Dispatcher.dispatch({ actionType: Constants.START_SELECTION, scrollLeft, scrollTop, clientX, clientY });
	}
};
module.exports = AppActions;