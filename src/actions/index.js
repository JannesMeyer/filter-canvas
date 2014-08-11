var AppDispatcher = require('../dispatcher/AppDispatcher');
var Constants = require('../constants');

var actions = {
	move: function(id, x, y) {
		AppDispatcher.handleViewAction({
			actionType: Constants.FILTER_MOVE,
			id,
			x,
			y
		});
	}
};
module.exports = actions;