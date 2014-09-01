var WireStore = require('../flux/WireStore.js');

// TODO: don't clear after a width/height change
// this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

var WWire = React.createClass({
	ctx: null,
	lineWidth: null,
	pStart: null,
	pContext1: null,
	pContext2: null,
	pEnd: null,
	draw() {
		var ctx = this.ctx;
		if (!ctx) {
			ctx = this.ctx = this.getDOMNode().getContext('2d');
		}
		ctx.lineWidth = this.lineWidth;
		ctx.beginPath();
		ctx.moveTo(this.pStart[0], this.pStart[1]);
		ctx.bezierCurveTo(this.pContext1[0], this.pContext1[1], this.pContext2[0], this.pContext2[1], this.pEnd[0], this.pEnd[1]);
		ctx.stroke();
	},
	shouldComponentUpdate(nextProps, nextState) {
		// Prevent overdraw
		return false;
	},
	componentDidUpdate(prevProps, prevState) {
		this.draw();
	},
	componentDidMount() {
		this.draw();
		WireStore.register(this.props.key, this);
	},
	componentWillUnmount() {
		WireStore.unregister(this.props.key);
	},
	render() {
		var pFrom = this.props.connection.fromPoint;
		var pTo = this.props.connection.toPoint;
		var lineWidthHalf = Math.ceil(this.props.width / 2);
		var lineWidth = lineWidthHalf * 2;

		if (pFrom[0] > pTo[0]) {
			this.ctx = null;
			return null;
		}

		var left = pFrom[0];
		var width = pTo[0] - pFrom[0];
		var top = Math.min(pTo[1], pFrom[1]);
		var height = Math.abs(pTo[1] - pFrom[1]) + lineWidth;

		if (pFrom[1] < pTo[1]) {
			this.pStart = [0, lineWidthHalf];
			this.pEnd = [width, height - lineWidthHalf];
		} else {
			this.pStart = [0, height - lineWidthHalf];
			this.pEnd = [width, lineWidthHalf];
		}
		this.lineWidth = lineWidth;
		this.pContext1 = [width * 0.4, this.pStart[1]];
		this.pContext2 = [width * 0.6, this.pEnd[1]];

		return <canvas className="wire" width={width} height={height} style={{ left: left+'px', top: top+'px' }} />;
	}
});
module.exports = WWire;