var EtherMovementStore = require('../flux/EtherMovementStore');
var Point = require('../lib/ImmutablePoint');
var Rect = require('../lib/ImmutableRect');

function calculateFrame(startPoint, endPoint, lineWidth) {
	var orderedX = startPoint.x < endPoint.x;
	var orderedY = startPoint.y < endPoint.y;
	if (!orderedX) {
		// TODO: draw the wire to a previous location
		return null;
	}
	if (orderedY) {
		return new Rect(
			startPoint.x, startPoint.y,
			endPoint.x - startPoint.x, endPoint.y - startPoint.y + lineWidth
		);
	} else {
		return new Rect(
			startPoint.x, endPoint.y,
			endPoint.x - startPoint.x, startPoint.y - endPoint.y + lineWidth
		);
	}
}

function calculateBezierPoints(frame, startPoint, endPoint, lineWidth) {
	if (frame === null) {
		return null;
	}
	var orderedX = startPoint.x < endPoint.x;
	var orderedY = startPoint.y < endPoint.y;
	if (!orderedX) {
		// TODO: draw the wire to a previous location
		return null;
	}
	var upperY = lineWidth / 2;
	var lowerY = frame.height - lineWidth / 2;
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
}

var WWire = React.createClass({
	context: null,
	bezier: null,

	draw() {
		var ctx = this.context;
		if (!ctx) {
			var canvas = this.getDOMNode();
			if (!canvas) {
				return;
			}
			this.context = canvas.getContext('2d');
			ctx = this.context;
		}
		var bez = this.bezier;

		ctx.beginPath();
		ctx.moveTo(bez[0].x, bez[0].y);
		ctx.bezierCurveTo(bez[1].x, bez[1].y, bez[2].x, bez[2].y, bez[3].x, bez[3].y);
		// ctx.closePath();
		// ctx.lineTo(this.pEnd[0], this.pEnd[1]);

		ctx.strokeStyle = '#3faefc';
		ctx.lineWidth = this.props.width;
		ctx.stroke();

		ctx.strokeStyle = '#63e4ff';
		ctx.lineWidth = this.props.width - 2;
		ctx.stroke();
	},
	shouldComponentUpdate(nextProps, nextState) {
		// Prevent overdrawing the canvas, we manually draw through forceUpdate()
		return false;
	},
	componentDidUpdate(prevProps, prevState) {
		this.draw();
	},
	componentDidMount() {
		this.draw();
		EtherMovementStore.registerWire(this.props.key, this);
	},
	componentWillUnmount() {
		EtherMovementStore.unregisterWire(this.props.key);
	},
	render() {
		console.log('WWire ' + this.props.key);
		var cn = this.props.connection;
		var frame = calculateFrame(cn.fromPoint, cn.toPoint, this.props.width);
		this.bezier = calculateBezierPoints(frame, cn.fromPoint, cn.toPoint, this.props.width);

		if (this.bezier === null) {
			this.context = null;
			return null;
		}

		return <canvas className="wire" width={frame.width} height={frame.height} style={{left:frame.x+'px', top:frame.y+'px'}} />;
	}
});
module.exports = WWire;