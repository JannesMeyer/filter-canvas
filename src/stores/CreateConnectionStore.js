var { Vector } = require('immutable');
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchStore = require('./WorkbenchStore');
var WorkbenchLayout = require('../WorkbenchLayout');
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

// Store data
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

	/**
	 * This function signals to the outside that a new connection is currently being
	 * dragged (that means that the left mouse button is being held down and the drag
	 * started on top of a Connector)
	 *
	 * @see Connector.react.js
	 */
	isDragging() {
		return isDragging;
	},

	/**
	 * This function is called whenever a connection drag is started to find all
	 * eligible targets that the new connection could be connected to.
	 *
	 * Among other things, this is used to display an orange glow around the
	 * target connectors.
	 *
	 * @see Connector.react.js
	 */
	isEligibleTarget(address) {
		if (!isDragging) { return false; }

		// Relies on the use of .equals() instead of pointer comparison
		return eligibleTargets.contains(address);
	},

	/**
	 * Returns true when the user's mouse cursor is in a location that would
	 * create a connection if the connection drag ended there.
	 *
	 * @see Connector.react.js
	 */
	isMouseOver(address) {
		if (!mouseOverConnector) { return false; }

		// Relies on the use of .equals() instead of pointer comparison
		return mouseOverConnector.equals(address);
	},

	/**
	 * Is called when the mouse was released and the connection drag ends.
	 *
	 * @see AppActions.js
	 * @return true if the mouse was released on top of an eligible connector.
	 */
	isComplete() {
		// TODO: improve this API
		// TODO: getMouseOverConnector()
		return address && mouseOverConnector;
	},

	/**
	 * Returns the addresses of the start connector and the end connector.
	 *
	 * @see AppActions.js
	 */
	getAddresses() {
		return [address, mouseOverConnector];
	},

	/**
	 * Returns the start and end coordinates of the connection while it's being
	 * dragged.
	 *
	 * @return { startPoint, endPoint }
	 */
	getPoints() {
		// Output or input?
		if (address && address.get(1)) {
			return { startPoint: origin, endPoint: lastPos };
		} else {
			return { startPoint: lastPos, endPoint: origin };
		}
	}

});

// Register for all actions with the dispatcher
CreateConnectionStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {

	/**
	 * When a connection drag is started.
	 */
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
			.valueSeq() // Get rid of they messed up keys
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


	/**
	 * When the mouse was moved after a connection drag has been started
	 */
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


	/**
	 * When the mouse was released. Resets all the internal information.
	 * The actual persisting of the connection is handled by WorkbenchStore.js
	 */
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
	}
});

module.exports = CreateConnectionStore;