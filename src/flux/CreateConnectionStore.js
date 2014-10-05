var WorkbenchStore = require('../flux/WorkbenchStore');
var BaseStore = require('../lib/BaseStore');
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
			var itemId = action.connector[0];
			var isOutput = action.connector[1];

			var item = WorkbenchStore.getItem(itemId);
			var type = item.get('type');
			var frame = item.get('rect');
			var isFilter = (type === constants.ITEM_TYPE_FILTER);
			var isPipe = (type === constants.ITEM_TYPE_PIPE);
			var offset = WorkbenchStore.getConnectorOffset(action.connector);

			if (isOutput) {
				startPoint = frame.moveBy(offset);
				endPoint = action.mousePos;
			} else {
				startPoint = action.mousePos;
				endPoint = frame.moveBy(offset);
			}

			// TODO: perhaps not the best idea to modify the DOM from here
			if (isFilter) {
				document.body.classList.add('s-create-connection-from-filter');
			} else if (isPipe) {
				document.body.classList.add('s-create-connection-from-pipe');
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
			// TODO: perhaps not the best idea to modify the DOM from here
			document.body.classList.remove('s-create-connection-from-filter');
			document.body.classList.remove('s-create-connection-from-pipe');

			isDragging = false;
			CreateConnectionStore.emitChange();
		break;
	}
});

module.exports = CreateConnectionStore;