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
	getConnectorOffset(parentFrame, numConnectors, isOutput, connectorId) {
		var cHeight = numConnectors * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
		var cPos    = connectorId   * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
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
		var frame;
		if (startPoint.x < endPoint.x) {
			// Draw the wire to a following location
			frame = Rect.fromTwoPoints(startPoint, endPoint);
			frame.height += WIRE_WIDTH;
		} else {
			// Draw the wire to a previous location
			frame = Rect.fromTwoPoints(startPoint, endPoint);
			frame.height += WIRE_WIDTH;
			frame.x -= 100;
			frame.width += 200;
		}
		return frame;
	},

	getBezierPoints(frame, startPoint, endPoint) {
		var p0, p1, p2, p3;
		var width = frame.width;
		var height = frame.height;
		var y1 = WIRE_WIDTH / 2;
		var y2 = height - WIRE_WIDTH / 2;
		if (startPoint.y > endPoint.y) { [y1, y2] = [y2, y1]; }
		if (startPoint.x < endPoint.x) {
			// Draw the wire to a following location
			p0 = new Point(0, y1);
			p1 = new Point(Math.min(0.4 * width,         200), y1);
			p2 = new Point(Math.max(0.6 * width, width - 200), y2);
			p3 = new Point(width, y2);
		} else {
			// Draw the wire to a previous location
			p0 = new Point(width - 100, y1);
			p1 = new Point(width,       y1);
			p2 = new Point(0,   y2);
			p3 = new Point(100, y2);
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