var dispatcher = require('./dispatcher');
var constants = require('./constants');

/**
 * filterActions single object
 * (like a singleton in Java)
 */
var filterActions = {
	move(id, x, y) {
		dispatcher.dispatch({
			actionType: constants.FILTER_MOVE,
			id, x, y
		});
	}
};
module.exports = filterActions;