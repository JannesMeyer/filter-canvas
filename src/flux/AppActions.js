var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');
var WorkbenchStore = require('./WorkbenchStore');

/**
 * AppActions single object (like a singleton)
 */
var AppActions = {
	startDragFromRepo(id, x, y) {
		Dispatcher.dispatch({ actionType: Constants.START_DRAG_FROM_REPO, id, x, y });
	},
	startDragOnWorkbench(id, element, clientX, clientY) {
		Dispatcher.dispatch({ actionType: Constants.START_DRAG_ON_WORKBENCH, id, element, clientX, clientY });
	},
	draggingOnWorkbench(clientX, clientY) {
		Dispatcher.dispatch({ actionType: Constants.DRAGGING_ON_WORKBENCH, clientX, clientY });
	},
	endDragOnWorkbench(clientX, clientY) {
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH });

		var {x, y} = WorkbenchStore.getAmountDragged(clientX, clientY);
		var distance = Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
		if (distance < 2) {
			Dispatcher.dispatch({ actionType: Constants.ITEM_CLICKED_ON_WORKBENCH });
		} else {
			Dispatcher.dispatch({ actionType: Constants.MOVE_BY_ON_WORKBENCH, x, y });
		}
	}
};
module.exports = AppActions;