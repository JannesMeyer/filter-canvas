var WWire = React.createClass({
	ctx: null,
	pStart: null,
	c1: null,
	c2: null,
	pEnd: null,
	shouldComponentUpdate(nextProps, nextState) {
		return (this.props.connection !== nextProps.connection ||
		        this.props.width !== nextProps.width);
	},
	draw() {
		this.ctx.beginPath();
		this.ctx.moveTo(this.pStart[0], this.pStart[1]);
		this.ctx.bezierCurveTo(this.c1[0], this.c1[1], this.c2[0], this.c2[1], this.pEnd[0], this.pEnd[1]);
		this.ctx.lineWidth = this.props.width;
		// this.ctx.strokeStyle = '#f00';
		this.ctx.stroke();
	},
	componentDidMount() {
		var canvas = this.getDOMNode();
		this.ctx = canvas.getContext('2d');
		this.draw();
	},
	componentDidUpdate(prevProps, prevState) {
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.draw();
	},
	render() {
		var connection = this.props.connection;
		var pFrom = connection.get('fromPoint').toArray();
		var pTo = connection.get('toPoint').toArray();

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