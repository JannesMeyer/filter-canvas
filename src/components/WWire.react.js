var ctx;
var pStart, c1, c2, pEnd;

var WWire = React.createClass({
	shouldComponentUpdate(nextProps, nextState) {
		return (this.props.wire !== nextProps.wire ||
		        this.props.lineWidth !== nextProps.lineWidth);
	},
	draw() {
		console.log('redraw');
		ctx.beginPath();
		ctx.moveTo(pStart[0], pStart[1]);
		ctx.bezierCurveTo(c1[0], c1[1], c2[0], c2[1], pEnd[0], pEnd[1]);
		ctx.lineWidth = this.props.lineWidth;
		// ctx.strokeStyle = '#f00';
		ctx.stroke();
	},
	componentDidMount() {
		var canvas = this.getDOMNode();
		ctx = canvas.getContext('2d');
		this.draw();
	},
	componentDidUpdate(prevProps, prevState) {
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		this.draw();
	},
	render() {
		var pFrom = this.props.wire.get('fromPoint').toArray();
		var pTo = this.props.wire.get('toPoint').toArray();

		// TODO: calculate boundaries in a better way (Math.max)
		// Swap the variables if necessary
		if (pFrom[0] > pTo[0]) {
			[pFrom, pTo] = [pTo, pFrom];
		}

		var width = pTo[0] - pFrom[0];
		var height = pTo[1] - pFrom[1];
		var xMiddle = Math.round(width / 2);
		var halfOfLineWidth = Math.ceil(this.props.lineWidth / 2);

		pStart = [0, halfOfLineWidth];
		pEnd = [width, halfOfLineWidth + height];
		c1 = [xMiddle, pStart[1]];
		c2 = [xMiddle, pEnd[1]];

		var style = {
			position: 'absolute',
			left: pFrom[0] + 'px',
			top: (pFrom[1] - halfOfLineWidth) + 'px'
		};
		return (
			<canvas width={width} height={height + halfOfLineWidth * 2} style={style} />
		);
	}
});
module.exports = WWire;