var SelectionStore = require('../flux/SelectionStore.js');
var Point = require('../lib/ImmutablePoint');

var WWire = React.createClass({
	context: null,
	lineWidth: null,
	pStart: null,
	pContext1: null,
	pContext2: null,
	pEnd: null,

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
		ctx.beginPath();
		ctx.moveTo(this.pStart.x, this.pStart.y);
		ctx.bezierCurveTo(this.pContext1.x, this.pContext1.y, this.pContext2.x, this.pContext2.y, this.pEnd.x, this.pEnd.y);
		// ctx.closePath();
		// ctx.lineTo(this.pEnd[0], this.pEnd[1]);

		ctx.strokeStyle = '#3faefc';
		ctx.lineWidth = this.lineWidth;
		ctx.stroke();

		ctx.strokeStyle = '#63e4ff';
		ctx.lineWidth = this.lineWidth - 2;
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
		SelectionStore.registerWire(this.props.key, this);
	},
	componentWillUnmount() {
		SelectionStore.unregisterWire(this.props.key);
	},
	render() {
		var pFrom = this.props.connection.fromPoint;
		var pTo = this.props.connection.toPoint;
		var lineWidthHalf = Math.ceil(this.props.width / 2);
		var lineWidth = lineWidthHalf * 2;

		if (pFrom.x > pTo.x) {
			// TODO: draw the wire to a previous location
			this.context = null;
			return null;
		}

		var left = pFrom.x;
		var width = pTo.x - pFrom.x;
		var top = Math.min(pTo.y, pFrom.y);
		var height = Math.abs(pTo.y - pFrom.y) + lineWidth;

		if (pFrom.y < pTo.y) {
			this.pStart = new Point(0,              lineWidthHalf);
			this.pEnd   = new Point(width, height - lineWidthHalf);
		} else {
			this.pStart = new Point(0,     height - lineWidthHalf);
			this.pEnd   = new Point(width,          lineWidthHalf);
		}
		this.lineWidth = lineWidth;
		this.pContext1 = new Point(Math.min(0.5 * width, 200), this.pStart.y);
		this.pContext2 = new Point(Math.min(0.5 * width, 200), this.pEnd.y);

		var style = { left: left + 'px', top: top + 'px' };
		return <canvas className="wire" width={width} height={height} style={style} />;
	}
});
module.exports = WWire;