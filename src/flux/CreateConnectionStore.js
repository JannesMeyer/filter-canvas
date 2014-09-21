var immutable = require('immutable');
var BaseStore = require('../lib/BaseStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createStore({

});

CreateConnectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.START_CONNECTION:
			console.log('start connection from', connector);
		break;

		case constants.RESIZE_CONNECTION:
			console.log('resize connection');
		break;

		case constants.FINISH_CONNECTION:
			console.log('finish connection');
		break;

		case constants.CANCEL_CONNECTION:
			console.log('cancel connection');
		break;
	}
});

module.exports = CreateConnectionStore;