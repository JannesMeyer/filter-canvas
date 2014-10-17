var Point = require('./lib/ImmutablePoint');
var Rect = require('./lib/ImmutableRect');

// Some constants
var WIRE_WIDTH        = 8;
var CONNECTOR_WIDTH   = 12;
var CONNECTOR_HEIGHT  = 8;
var CONNECTOR_MARGIN  = 4;
var PIPE_WIDTH        = 50;
var PIPE_MIN_HEIGHT   = 32;
var PIPE_CPADDING     = 10;
var FILTER_MIN_WIDTH  = 140;
var FILTER_MIN_HEIGHT = 60;
var FILTER_CPADDING   = 28;

/**
 * The WorkbenchLayout object calculates the positions and sizes of most things
 * on the Workbench.
 */
var WorkbenchLayout = {

	/**
	 * Returns a Rect with the position and size of the pipe on the Workbench
	 */
	getPipeFrame(x, y, name, inputs, outputs) {
		var c = Math.max(inputs, outputs);
		var cHeight = c * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;

		var width = PIPE_WIDTH;
		var height = Math.max(PIPE_MIN_HEIGHT, cHeight + PIPE_CPADDING);
		return new Rect(x, y, width, height);
	},

	/**
	 * Returns a Rect with the position and size of the filter on the Workbench
	 */
	getFilterFrame(x, y, name, inputs, outputs) {
		var c = Math.max(inputs, outputs);
		var cHeight = c * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;

		var width = Math.max(FILTER_MIN_WIDTH, Math.floor(name.length * 5.5) + 40);
		var height = Math.max(FILTER_MIN_HEIGHT, cHeight + FILTER_CPADDING);
		return new Rect(x, y, width, height);
	},

	/**
	 * Calculates the offset of a connector to its filter. The reference point (0, 0)
	 * is the top left of the filter and the offset is calculated towards the outer edge
	 * of the connector (vertically the offset is in the middle of the connector).
	 */
	getConnectorOffset(parentFrame, numConnectors, isOutput, connectorId) {
		var cHeight = numConnectors * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
		var cPos    = connectorId   * (CONNECTOR_MARGIN + CONNECTOR_HEIGHT) + CONNECTOR_MARGIN;
		var cCenter = Math.floor(Math.abs(CONNECTOR_HEIGHT - WIRE_WIDTH) / 2);

		var x = isOutput ? parentFrame.width + CONNECTOR_WIDTH/2 : -CONNECTOR_WIDTH/2;
		var y = Math.round((parentFrame.height - cHeight) / 2 + cPos + cCenter);
		return new Point(x, y);
	},

	/**
	 * Calculates the bounding box inside of which the mouse cursor should be considered
	 * "hovering" over a connector.
	 *
	 * pos: the position of the connector's outer edge (this is calculated by adding the
	 *      connector's offset to its item's position)
	 * isOutput: 0 when it's an input connector
	 *           1 when it's an output connector
	 */
	getConnectorBoundingBox(pos, isOutput) {
		// Extend the bounding box by 16 pixels outwards
		// Which is composed of these approximations:
		//  - Width of a typical cursor: 11 pixels (Mac OSX)
		//  - Size of the box shadow:     5 pixels
		var x     = isOutput ? pos.x - CONNECTOR_WIDTH : pos.x - 16;
		var width = CONNECTOR_WIDTH + 16;

		// Extend the frame by the margin vertically
		// (it is important that the bounding boxes don't overlap)
		var y      = pos.y - CONNECTOR_MARGIN/2;
		var height = WIRE_WIDTH + CONNECTOR_MARGIN;

		return new Rect(x, y, width, height);
	},

	/**
	 * Returns a Rect with the position and size of the canvas element
	 * that will be housing the bezier curve connecting outputs to inputs.
	 *
	 * startPoint: the start point (in the coordinate system of the Workbench)
	 * endPoint: the end point (in the coordinate system of the Workbench)
	 */
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

	/**
	 * Returns 4 points in the coordinate system of the canvas (not the
	 * whole Workbench's coordinate system). These 4 points will be used
	 * to draw a bezier curve connecting output to inputs.
	 *
	 * frame: The canvas' width and height
	 * startPoint: the start point (in the coordinate system of the Workbench)
	 * endPoint: the end point (in the coordinate system of the Workbench)
	 */
	getBezierPoints(frame, startPoint, endPoint) {
		var p0, p1, p2, p3; // the variables that are going to be calculated

		var y1 =                WIRE_WIDTH / 2;
		var y2 = frame.height - WIRE_WIDTH / 2;
		if (startPoint.y > endPoint.y) { [y1, y2] = [y2, y1]; }

		if (startPoint.x < endPoint.x) {
			// Draw the wire to a following location
			p0 = new Point(0, y1);
			p1 = new Point(Math.min(0.4 * frame.width,               200), y1);
			p2 = new Point(Math.max(0.6 * frame.width, frame.width - 200), y2);
			p3 = new Point(frame.width, y2);
		} else {
			// Draw the wire to a previous location
			p0 = new Point(frame.width - 100, y1);
			p1 = new Point(frame.width,       y1);
			p2 = new Point(0,   y2);
			p3 = new Point(100, y2);
		}
		return [p0, p1, p2, p3];
	},

	/**
	 * Returns the width of the bezier curves that are connecting the outputs
	 * to inputs.
	 */
	getWireWidth() {
		return WIRE_WIDTH;
	}

};
module.exports = WorkbenchLayout;