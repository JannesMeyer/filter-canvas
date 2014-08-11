var AppDispatcher = require('../dispatcher/AppDispatcher');
var constants = require('../constants');

var actions = {
	move: function(id, x, y) {
		AppDispatcher.handleViewAction({
			actionType: constants.FILTER_MOVE,
			id, x, y
		});
	}
};

module.exports = actions;