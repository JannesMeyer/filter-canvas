var WorkbenchStore = require('../flux/WorkbenchStore');
var BaseStore = require('../lib/BaseStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var isDragging = false;
var eligibleConnectors = [];
var isOutput;
var origin;
var lastPos;

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createEventEmitter(['stateChange', 'change'], {

	isDragging() {
		return isDragging;
	},

	isEligibleTarget(address) {
		for (var i = 0; i < eligibleConnectors.length; i++) {
			var connector = eligibleConnectors[i];
			if (connector[0] === address[0] &&
			    connector[1] === address[1] &&
			    connector[2] === address[2]) {
				return true;
			}
		}
		return false;
	},

	getPoints() {
		if (isOutput) {
			return { startPoint: origin, endPoint: lastPos };
		} else {
			return { startPoint: lastPos, endPoint: origin };
		}
	}

});

CreateConnectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {

		case constants.START_CONNECTION:
			var itemId = action.connector[0];
			isOutput = action.connector[1];

			var item = WorkbenchStore.getItem(itemId);
			var frame = item.get('rect');
			var type = item.get('type');
			var isFilter = (type === constants.ITEM_TYPE_FILTER);
			var isPipe = (type === constants.ITEM_TYPE_PIPE);
			var offset = WorkbenchStore.getConnectorOffset(action.connector);

			origin = frame.moveBy(offset);
			lastPos = action.mousePos;
			isDragging = true;

			// Find eligible target connectors
			// TODO: use flatMap() here as soon as the new version of immutable comes out
			eligibleConnectors = [];
			WorkbenchStore.getAllItems().forEach((item, itemId) => {
				// Find opposites
				if (type === item.get('type')) {
					return;
				}
				item.get(isOutput ? 'inputs' : 'outputs').forEach((connectedTo, connectorId) => {
					if (connectedTo) {
						return;
					}
					eligibleConnectors.push([itemId, Number(!isOutput), connectorId]);
				});
			});

			CreateConnectionStore.emitStateChange();
			CreateConnectionStore.emitChange();
		break;

		case constants.RESIZE_CONNECTION:
			lastPos = action.mousePos;
			// TODO: find mouseover (WorkbenchLayout)

			CreateConnectionStore.emitChange();
		break;

		case constants.CANCEL_CONNECTION:
		case constants.FINISH_CONNECTION:
			// TODO: In case of finish, use action.mousePos
			isDragging = false;
			eligibleConnectors = [];
			CreateConnectionStore.emitStateChange();
			CreateConnectionStore.emitChange();
		break;

	}
});

module.exports = CreateConnectionStore;