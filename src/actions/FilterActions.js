var AppDispatcher = require('../dispatcher/AppDispatcher');
var constants = require('../constants');

var actions = {
	move: function(id, x, y) {
		AppDispatcher.handleViewAction({
			id, x, y, actionType: constants.FILTER_MOVE
		});
	}
};

module.exports = actions;