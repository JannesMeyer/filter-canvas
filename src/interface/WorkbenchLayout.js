var Point = require('../lib/ImmutablePoint');
var Rect = require('../lib/ImmutableRect');

var CONNECTOR_HEIGHT = 8;
var CONNECTOR_MARGIN = 4;
var WIRE_WIDTH = 8;

var WorkbenchLayout = {

	getFilterFrame(x, y, name, inputs, outputs) {
		var c = Math.max(inputs, outputs);
		var cHeight = c * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;

		var width = Math.max(140, Math.floor(name.length * 5.5) + 40);
		var height = Math.max(60, cHeight + 28);
		return new Rect(x, y, width, height);
	},

	/**
	 * Calculates the offset of a connector to the top left point of its filter
	 */
	getConnectorOffset(parentFrame, numConnectors, isOutput, connector) {
		var cHeight = numConnectors * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
		var cPos    = connector     * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
		var cCenter = Math.floor(Math.abs(CONNECTOR_HEIGHT - WIRE_WIDTH) / 2);

		var x = isOutput ? parentFrame.width + 6 : -6;
		var y = Math.round((parentFrame.height - cHeight) / 2 + cPos + cCenter);
		return new Point(x, y);
	},

	getPipeFrame(x, y, name, inputs, outputs) {
		var c = Math.max(inputs, outputs);
		var cHeight = c * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;

		var height = Math.max(32, cHeight + 10);
		return new Rect(x, y, 50, height);
	},

	getConnectionFrame(startPoint, endPoint) {
		if (!startPoint || !endPoint) {
			return null;
		}
		var orderedX = startPoint.x < endPoint.x;
		var orderedY = startPoint.y < endPoint.y;
		if (!orderedX) {
			// TODO: draw the wire to a previous location
			return null;
		}
		if (orderedY) {
			return new Rect(
				startPoint.x, startPoint.y,
				endPoint.x - startPoint.x, endPoint.y - startPoint.y + WIRE_WIDTH
			);
		} else {
			return new Rect(
				startPoint.x, endPoint.y,
				endPoint.x - startPoint.x, startPoint.y - endPoint.y + WIRE_WIDTH
			);
		}
	},

	getBezierPoints(frame, startPoint, endPoint) {
		if (frame === null) {
			return null;
		}
		var orderedX = startPoint.x < endPoint.x;
		var orderedY = startPoint.y < endPoint.y;
		if (!orderedX) {
			// TODO: draw the wire to a previous location
			return null;
		}
		var upperY = WIRE_WIDTH / 2;
		var lowerY = frame.height - WIRE_WIDTH / 2;
		var middleX = Math.min(0.5 * frame.width, 200);
		var p0, p1, p2, p3;
		if (orderedY) {
			p0 = new Point(0, upperY);
			p1 = new Point(middleX, upperY);
			p2 = new Point(middleX, lowerY);
			p3 = new Point(frame.width, lowerY);
		} else {
			p0 = new Point(0, lowerY);
			p1 = new Point(middleX, lowerY);
			p2 = new Point(middleX, upperY);
			p3 = new Point(frame.width, upperY);
		}
		return [p0, p1, p2, p3];
	},

	/**
	 * returns a number
	 */
	getWireWidth() {
		return WIRE_WIDTH;
	}

};
module.exports = WorkbenchLayout;