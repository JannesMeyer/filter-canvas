var { Vector } = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

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
			if (connector.get(0) === address.get(0) &&
			    connector.get(1) === address.get(1) &&
			    connector.get(2) === address.get(2)) {
				return true;
			}
		}
		return false;
	},

	isMouseOver(address) {
		return mouseOverConnector &&
			mouseOverConnector.get(0) === address.get(0) &&
			mouseOverConnector.get(1) === address.get(1) &&
			mouseOverConnector.get(2) === address.get(2);
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
		if (address && address.get(1)) {
			return { startPoint: origin, endPoint: lastPos };
		} else {
			return { startPoint: lastPos, endPoint: origin };
		}
	}

});

CreateConnectionStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {

		case Constants.START_CONNECTION:
			address = immutable.Vector.from(action.connector);
			var isOutput = address.get(1);

			var item = WorkbenchStore.getItem(address.get(0));
			var type = item.get('type');

			origin = WorkbenchStore.getConnectorPosition(address);
			// TODO: workbenchlayout (linewidth/2)
			action.mousePos.y -= 4;
			lastPos = action.mousePos;
			isDragging = true;

			// Find eligible target connectors
			// TODO: use flatMap() here as soon as the new version of immutable comes out
			eligibleConnectors = [];
			connectorFrames = [];
			WorkbenchStore.getAllItems().forEach((item, itemId) => {
				// The Vector could be sparse after elements have been deleted from it
				if (!item) { return; }

				// Find opposites
				if (type === item.get('type')) { return; }

				item.get(isOutput ? 'inputs' : 'outputs').forEach((connectedTo, connectorId) => {
					if (connectedTo) {
						return;
					}
					eligibleConnectors.push(Vector(itemId, Number(!isOutput), connectorId));
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

		case Constants.RESIZE_CONNECTION:
			// TODO: workbenchlayout (linewidth/2)
			action.absMousePos.y -= 4;
			lastPos = action.absMousePos;
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

		case Constants.FINISH_CONNECTION:
		case Constants.CANCEL_CONNECTION:
			isDragging = false;
			eligibleConnectors = [];
			connectorFrames = [];
			mouseOverConnector = null;
			CreateConnectionStore.emitChange();
		break;

	}
});

module.exports = CreateConnectionStore;