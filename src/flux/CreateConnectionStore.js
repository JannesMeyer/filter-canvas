var Rect = require('../lib/ImmutableRect');
var WorkbenchStore = require('../flux/WorkbenchStore'); // late import
var BaseStore = require('../lib/BaseStore');
var dispatcher = require('./dispatcher');
var constants = require('./constants');

// Data
var isDragging = false;
var eligibleConnectors = [];
var connectorFrames = [];
var mouseOverConnector = null;
var address = null;
var origin;
var lastPos;

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createEventEmitter(['change'], {

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

	isMouseOver(address) {
		return mouseOverConnector &&
			mouseOverConnector[0] === address[0] &&
			mouseOverConnector[1] === address[1] &&
			mouseOverConnector[2] === address[2];
	},

	isComplete() {
		return address && mouseOverConnector;
	},

	// TODO: improve this API
	getAddresses() {
		return [address, mouseOverConnector];
	},

	getPoints() {
		// Output or input?
		if (address && address[1]) {
			return { startPoint: origin, endPoint: lastPos };
		} else {
			return { startPoint: lastPos, endPoint: origin };
		}
	}

});

CreateConnectionStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {

		case constants.START_CONNECTION:
			address = action.connector;
			var isOutput = address[1];

			var item = WorkbenchStore.getItem(address[0]);
			var frame = item.get('rect');
			var type = item.get('type');
			var isFilter = (type === constants.ITEM_TYPE_FILTER);
			var isPipe = (type === constants.ITEM_TYPE_PIPE);
			var offset = WorkbenchStore.getConnectorOffset(action.connector);

			origin = frame.moveBy(offset);
			// TODO: workbenchlayout (linewidth/2)
			action.mousePos.y -= 4;
			lastPos = action.mousePos;
			isDragging = true;

			// Find eligible target connectors
			// TODO: use flatMap() here as soon as the new version of immutable comes out
			eligibleConnectors = [];
			connectorFrames = [];
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

			connectorFrames = eligibleConnectors.map(address => {
				var pos = WorkbenchStore.getConnectorPosition(address);
				// TODO: put this into wblayout
				// TODO: use CGRect stuff
				var wireWidth = 8;
				return new Rect(pos.x - 6, pos.y - 2 - 4, 12+12, 8 + 4);
			});

			CreateConnectionStore.emitChange();
		break;

		case constants.RESIZE_CONNECTION:
			// TODO: workbenchlayout (linewidth/2)
			action.mousePos.y -= 4;
			lastPos = action.mousePos;
			// TODO: put this in WorkbenchLayout
			// TODO: use a rect function for the collision check

			mouseOverConnector = null;
			connectorFrames.forEach((frame, id) => {
				var check = frame.x < lastPos.x &&
				            frame.x + frame.width > lastPos.x &&
				            frame.y < lastPos.y &&
				            frame.y + frame.height > lastPos.y;
				if (mouseOverConnector !== null) {
					console.warn('double match');
				}
				if (check) {
					mouseOverConnector = eligibleConnectors[id];
				}
			});

			CreateConnectionStore.emitChange();
		break;

		case constants.FINISH_CONNECTION:
		case constants.CANCEL_CONNECTION:
			isDragging = false;
			eligibleConnectors = [];
			connectorFrames = [];
			mouseOverConnector = null;
			CreateConnectionStore.emitChange();
		break;

	}
});

module.exports = CreateConnectionStore;