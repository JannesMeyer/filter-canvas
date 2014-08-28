var Dispatcher = require('./Dispatcher');
var Constants = require('./Constants');

/**
 * FilterActions single object (like a singleton)
 */
var FilterActions = {
	startDragFromRepo(id, x, y) {
		Dispatcher.dispatch({
			actionType: Constants.START_DRAG_FROM_REPO,
			id, x, y
		});
	},
	move(id, x, y) {
		Dispatcher.dispatch({
			actionType: Constants.FILTER_MOVE,
			id, x, y
		});
	}
};
module.exports = FilterActions;