var WorkbenchStore = require('../flux/WorkbenchStore');
var BaseStore = require('../lib/BaseStore');
var WPath = require('../lib/WPath');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var isDragging = false;
var isOutput;
var startPoint;
var endPoint;

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createStore({

	isDragging() {
		return isDragging;
	},

	getPoints() {
		return { startPoint, endPoint };
	}

});

CreateConnectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {
		case constants.START_CONNECTION:
			console.log('start from', action.connector);
			// TODO: remove WPath
			var frame = WorkbenchStore.getItemPosition(action.connector[0]);
			var offset = WorkbenchStore.getConnectorOffset(new WPath(action.connector[0], action.connector[1], action.connector[2]));

			isOutput = action.connector[1];
			if (isOutput) {
				startPoint = frame.moveBy(offset);
				endPoint = action.mousePos;
			} else {
				startPoint = action.mousePos;
				endPoint = frame.moveBy(offset);
			}

			isDragging = true;
			CreateConnectionStore.emitChange();
		break;

		case constants.RESIZE_CONNECTION:
			if (isOutput) {
				endPoint = action.mousePos;
			} else {
				startPoint = action.mousePos;
			}
			CreateConnectionStore.emitChange();
		break;

		case constants.CANCEL_CONNECTION:
		case constants.FINISH_CONNECTION:
			isDragging = false;
			CreateConnectionStore.emitChange();
		break;
	}
});

module.exports = CreateConnectionStore;