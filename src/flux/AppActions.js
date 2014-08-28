var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

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
		Dispatcher.dispatch({ actionType: Constants.END_DRAG_ON_WORKBENCH, clientX, clientY });
	}
};
module.exports = AppActions;