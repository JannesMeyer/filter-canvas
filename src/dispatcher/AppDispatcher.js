var Dispatcher = require('./Dispatcher');

var AppDispatcher = new Dispatcher();

AppDispatcher.handleViewAction = function(action) {
	console.log(action.actionType + ':', action);
	this.dispatch({
		source: 'VIEW_ACTION',
		action: action
	});
};
AppDispatcher.handleServerAction = function(action) {
	this.dispatch({
		source: 'SERVER_ACTION',
		action: action
	});
};

module.exports = AppDispatcher;