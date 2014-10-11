var { Vector } = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

// Data
var isDragging = false;
var eligibleConnectors;
var connectorFrames;
var mouseOverConnector;
var address;
var origin;
var lastPos;

function isFalsy(obj) {
	return !Boolean(obj);
}

/**
 * CreateConnectionStore single object
 * (like a singleton)
 */
var CreateConnectionStore = BaseStore.createEventEmitter(['change'], {

	isDragging() {
		return isDragging;
	},

	isEligibleTarget(address) {
		if (!eligibleConnectors) { return false; }

		// Relies on the use of .equals() instead of pointer comparison
		return eligibleConnectors.contains(address);
	},

	isMouseOver(address) {
		if (!mouseOverConnector) { return false; }

		// Relies on the use of .equals() instead of pointer comparison
		return mouseOverConnector.equals(address);
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
			var sourceType = WorkbenchStore.getItem(address.get(0)).get('type');

			origin = WorkbenchStore.getConnectorPosition(address);
			// TODO: workbenchlayout (linewidth/2)
			action.mousePos.y -= 4;
			lastPos = action.mousePos;
			isDragging = true;

			// Find eligible target connectors
			// The items have to be of opposite types (filter-pipe or pipe-filter)
			eligibleConnectors = WorkbenchStore.getAllItems()
				.toKeyedSeq()
				.filter(item => item && item.get('type') !== sourceType)
				.flatMap((item, itemId) => {
					// Get all unconnected connectors' addresses
					return item.get(isOutput ? 'inputs' : 'outputs')
						.toKeyedSeq()
						.filter(isFalsy)
						.keySeq()
						.map(connectorId => Vector(itemId, Number(!isOutput), connectorId));
				})
				// TODO: it might be a bug in the library that we have to use valueSeq() after flattening
				.valueSeq()
				.cacheResult();

			connectorFrames = eligibleConnectors.map(address => {
					var pos = WorkbenchStore.getConnectorPosition(address);
					// TODO: put this into wblayout
					// TODO: use CGRect stuff
					// TODO: workbenchlayout (linewidth/2)
					var wireWidth = 8;
					// TODO: make sure that these never overlap
					return new Rect(pos.x - 6, pos.y - 2 - 4 - 4, 12+12, 8 + 6);
				})
				.cacheResult();

			CreateConnectionStore.emitChange();
		break;

		case Constants.RESIZE_CONNECTION:
			lastPos = action.absMousePos;

			var id = connectorFrames.findKey(f => f.containsPoint(lastPos));
			if (id !== undefined) {
				mouseOverConnector = eligibleConnectors.get(id);
			} else {
				mouseOverConnector = null;
			}

			// Helper code to make sure that none of the frames overlap
			// var count = connectorFrames.count(f => f.containsPoint(lastPos));
			// if (count > 1) {
			// 	console.warn('Double match');
			// }

			CreateConnectionStore.emitChange();
		break;

		case Constants.FINISH_CONNECTION:
		case Constants.CANCEL_CONNECTION:
			isDragging = false;
			eligibleConnectors = null;
			connectorFrames = null;
			mouseOverConnector = null;
			CreateConnectionStore.emitChange();
		break;

	}
});

module.exports = CreateConnectionStore;