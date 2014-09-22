var BaseStore = require('../lib/BaseStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var isDragging = false;

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createStore({

	isDragging() {
		return isDragging;
	}

});

CreateConnectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.START_CONNECTION:
			console.log('start from', action.connector);
			isDragging = true;
			CreateConnectionStore.emitChange();
		break;

		case constants.RESIZE_CONNECTION:
			// TODO: resize connection
			// CreateConnectionStore.emitChange();
		break;

		case constants.FINISH_CONNECTION:
			console.log('end at [...]');
			isDragging = false;
			CreateConnectionStore.emitChange();
		break;

		case constants.CANCEL_CONNECTION:
			console.log('Cancel');
			isDragging = false;
			CreateConnectionStore.emitChange();
		break;
	}
});

module.exports = CreateConnectionStore;