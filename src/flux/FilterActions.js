var dispatcher = require('./app-dispatcher');
var constants = require('./constants');

/**
 * FilterActions single object
 * (like a singleton in Java)
 */
var FilterActions = {
	move(id, x, y) {
		dispatcher.dispatch({
			actionType: constants.FILTER_MOVE,
			id, x, y
		});
	}
};
module.exports = FilterActions;