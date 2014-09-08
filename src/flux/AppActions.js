var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var	DragManager = require('./DragManager');
var WorkbenchStore = require('./WorkbenchStore');

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
		if (DragManager.isDragging()) {
			Dispatcher.dispatch({ actionType: Constants.DRAGGING_ON_WORKBENCH, clientX, clientY });
		} else if (DragManager.isSelecting()) {
			Dispatcher.dispatch({ actionType: Constants.MOVE_SELECTION, clientX, clientY });
		}
	},
	endDragOnWorkbench(clientX, clientY) {
		if (DragManager.isSelecting()) {
			Dispatcher.dispatch({
				actionType: Constants.END_SELECTION,
				selection: DragManager.getSelectionRect()
			});
		}
		if (!DragManager.isDragging()) {
			return;
		}
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH });

		if (DragManager.getSelectedItemType() !== 'WFilter') {
			return;
		}

		var id = DragManager.getSelectedItemId();
		var {x, y} = DragManager.getAmountDragged(clientX, clientY);

		var distance = Math.sqrt(x * x + y * y);
		if (distance < 1) {
			Dispatcher.dispatch({ actionType: Constants.ITEM_CLICKED_ON_WORKBENCH, id });
		} else {
			Dispatcher.dispatch({ actionType: Constants.MOVE_BY_ON_WORKBENCH, id, x, y });
		}
	},
	startSelection(scrollLeft, scrollTop, clientX, clientY) {
		Dispatcher.dispatch({ actionType: Constants.START_SELECTION, scrollLeft, scrollTop, clientX, clientY });
	}
};
module.exports = AppActions;