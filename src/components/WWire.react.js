var WWire = React.createClass({
	context: null,

	draw() {
		if (!this.context) {
			this.context = this.getDOMNode().getContext('2d');
		}
		var ctx = this.context;
		var bez = this.props.bezier;

		ctx.beginPath();
		ctx.moveTo(bez[0].x, bez[0].y);
		ctx.bezierCurveTo(bez[1].x, bez[1].y, bez[2].x, bez[2].y, bez[3].x, bez[3].y);

		ctx.strokeStyle = '#3faefc';
		ctx.lineWidth = this.props.width;
		ctx.stroke();

		ctx.strokeStyle = '#63e4ff';
		ctx.lineWidth = this.props.width - 2;
		ctx.stroke();
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.frame && nextProps.frame &&
		      !this.props.frame.equals(nextProps.frame);
	},

	shouldComponentRedraw(prevProps) {
		return prevProps.frame.width  !== this.props.frame.width ||
		       prevProps.frame.height !== this.props.frame.height;
	},

	componentDidUpdate(prevProps, prevState) {
		if (this.shouldComponentRedraw(prevProps)) {
			this.draw();
		}
	},

	componentDidMount() {
		this.draw();
	},

	render() {
		var frame = this.props.frame;
		var style = {
			left: frame.x,
			top: frame.y
		};
		return <canvas className="wire" width={frame.width} height={frame.height} style={style} />;
	}

});
module.exports = WWire;