var DragManager = require('../flux/DragManager.js');

// TODO: don't clear after a width/height change
// this.context.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

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
			ctx = this.context = canvas.getContext('2d');
		}
		ctx.beginPath();
		ctx.moveTo(this.pStart[0], this.pStart[1]);
		ctx.bezierCurveTo(this.pContext1[0], this.pContext1[1], this.pContext2[0], this.pContext2[1], this.pEnd[0], this.pEnd[1]);

		ctx.strokeStyle = '#3faefc';
		ctx.lineWidth = this.lineWidth;
		ctx.stroke();

		ctx.strokeStyle = '#63e4ff';
		ctx.lineWidth = this.lineWidth - 2;
		ctx.stroke();
	},
	shouldComponentUpdate(nextProps, nextState) {
		// Prevent overdrawing the canvas
		return false;
	},
	componentDidUpdate(prevProps, prevState) {
		this.draw();
	},
	componentDidMount() {
		this.draw();
		DragManager.registerWire(this.props.key, this);
	},
	componentWillUnmount() {
		DragManager.unregisterWire(this.props.key);
	},
	render() {
		var pFrom = this.props.connection.fromPoint;
		var pTo = this.props.connection.toPoint;
		var lineWidthHalf = Math.ceil(this.props.width / 2);
		var lineWidth = lineWidthHalf * 2;

		if (pFrom[0] > pTo[0]) {
			// TODO: draw the wire to a previous location
			this.context = null;
			return null;
		}

		var left = pFrom[0];
		var width = pTo[0] - pFrom[0];
		var top = Math.min(pTo[1], pFrom[1]);
		var height = Math.abs(pTo[1] - pFrom[1]) + lineWidth;
		var middle = Math.min(200, width * 0.5);

		if (pFrom[1] < pTo[1]) {
			this.pStart = [ 0,     0      + lineWidthHalf ];
			this.pEnd   = [ width, height - lineWidthHalf ];
		} else {
			this.pStart = [ 0,     height - lineWidthHalf ];
			this.pEnd   = [ width, 0      + lineWidthHalf ];
		}
		this.lineWidth = lineWidth;
		this.pContext1 = [middle, this.pStart[1]];
		this.pContext2 = [middle, this.pEnd[1]];

		var style = { left: left + 'px', top: top + 'px' };
		return <canvas className="wire" width={width} height={height} style={style} />;
	}
});
module.exports = WWire;