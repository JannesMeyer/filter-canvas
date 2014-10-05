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
		if (!startPoint || !endPoint) {
			return;
		}

		var orderedX = startPoint.x < endPoint.x;
		var orderedY = startPoint.y < endPoint.y;
		var frame;
		if (orderedX) {
			// Draw the wire to a following location
			frame = Rect.fromTwoPoints(startPoint, endPoint);
			frame.height += WIRE_WIDTH;
		} else {
			// Draw the wire to a previous location
			frame = Rect.fromTwoPoints(startPoint, endPoint);
			frame.x -= 100;
			frame.width += 200;
			frame.height += WIRE_WIDTH;
		}
		return frame;
	},

	getBezierPoints(frame, startPoint, endPoint) {
		if (!frame) {
			return;
		}

		var orderedX = startPoint.x < endPoint.x;
		var orderedY = startPoint.y < endPoint.y;

		var y1 = WIRE_WIDTH / 2;
		var y2 = frame.height - WIRE_WIDTH / 2;
		if (!orderedY) { [y1, y2] = [y2, y1]; }
		var x1 = Math.min(0.4 * frame.width, 200);
		var x2 = Math.max(0.6 * frame.width, frame.width - 200);

		var p0, p1, p2, p3;
		if (orderedX) {
			// Draw the wire to a following location
			p0 = new Point(0, y1);
			p1 = new Point(x1, y1);
			p2 = new Point(x2, y2);
			p3 = new Point(frame.width, y2);
		} else {
			// Draw the wire to a previous location
			p0 = new Point(frame.width - 100, y1);
			p1 = new Point(frame.width, y1);
			p2 = new Point(0, y2);
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