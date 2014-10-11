var { Vector } = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var WorkbenchLayout = require('../WorkbenchLayout');
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

// Data
var isDragging = false;
var eligibleTargets;
var targetFrames;
var mouseOverConnector;
var address;
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
		if (!isDragging) { return false; }

		// Relies on the use of .equals() instead of pointer comparison
		return eligibleTargets.contains(address);
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
			isDragging = true;
			address = Vector.from(action.connector);
			origin = WorkbenchStore.getConnectorPosition(address);
			lastPos = action.mousePos;

			var sourceIsOutput = address.get(1);
			var sourceType = WorkbenchStore.getItem(address.get(0)).get('type');

			// Find eligible target connectors
			// The items have to be of opposite types (filter-pipe or pipe-filter)
			eligibleTargets = WorkbenchStore.getAllItems()
				.toKeyedSeq()
				.filter(item => item && item.get('type') !== sourceType)
				.flatMap((item, itemId) => {
					// Get all unconnected connectors' addresses
					return item.get(sourceIsOutput ? 'inputs' : 'outputs')
						.toKeyedSeq()
						.filter(value => !value)
						.keySeq()
						.map(connectorId => Vector(itemId, Number(!sourceIsOutput), connectorId));
				})
				// TODO: it might be a bug in the library that we have to use valueSeq() after flattening
				.valueSeq()
				.cacheResult();

			targetFrames = eligibleTargets
				.map(address => {
					// The WorkbenchStore caches these values
					var pos = WorkbenchStore.getConnectorPosition(address);
					return WorkbenchLayout.getConnectorBoundingBox(pos, address.get(1));
				})
				.cacheResult();

			CreateConnectionStore.emitChange();
		break;

		case Constants.RESIZE_CONNECTION:
			lastPos = action.absMousePos;

			var id = targetFrames.findKey(f => f.containsPoint(lastPos));
			if (id !== undefined) {
				mouseOverConnector = eligibleTargets.get(id);
			} else {
				mouseOverConnector = null;
			}

			CreateConnectionStore.emitChange();
		break;

		case Constants.FINISH_CONNECTION:
		case Constants.CANCEL_CONNECTION:
			isDragging = false;
			address = null;
			origin = null;
			lastPos = null;
			eligibleTargets = null;
			targetFrames = null;
			mouseOverConnector = null;
			CreateConnectionStore.emitChange();
		break;

	}
});

module.exports = CreateConnectionStore;