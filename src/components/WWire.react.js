var WireStore = require('../flux/WireStore.js');

var WWire = React.createClass({
	ctx: null,
	pStart: null,
	c1: null,
	c2: null,
	pEnd: null,
	draw() {
		// TODO: don't clear after a width/height change
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.ctx.moveTo(this.pStart[0], this.pStart[1]);
		this.ctx.bezierCurveTo(this.c1[0], this.c1[1], this.c2[0], this.c2[1], this.pEnd[0], this.pEnd[1]);
		this.ctx.lineWidth = this.props.width;
		this.ctx.stroke();
	},
	componentDidMount() {
		this.ctx = this.getDOMNode().getContext('2d');
		this.draw();
		WireStore.register(this.props.key, this);
	},
	componentWillUnmount() {
		WireStore.unregister(this.props.key);
	},
	componentDidUpdate(prevProps, prevState) {
		this.draw();
	},
	render() {
		var pFrom = this.props.connection.fromPoint;
		var pTo = this.props.connection.toPoint;

		// TODO: calculate boundaries in a better way (Math.max)
		// Swap the variables if necessary
		if (pFrom[0] > pTo[0]) {
			[pFrom, pTo] = [pTo, pFrom];
		}

		var width = pTo[0] - pFrom[0];
		var height = pTo[1] - pFrom[1];
		var xMiddle = Math.round(width / 2);
		var halfOfLineWidth = Math.ceil(this.props.width / 2);

		this.pStart = [0, halfOfLineWidth];
		this.pEnd = [width, halfOfLineWidth + height];
		this.c1 = [xMiddle, this.pStart[1]];
		this.c2 = [xMiddle, this.pEnd[1]];

		var style = {
			left: pFrom[0] + 'px',
			top: pFrom[1] + 'px'
		};
		return (
			<canvas className="wire" width={width} height={height + halfOfLineWidth * 2} style={style} />
		);
	}
});
module.exports = WWire;