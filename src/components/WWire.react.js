var WWire = React.createClass({
	context: null,

	draw() {
		var ctx = this.context;
		var bez = this.props.bezier;
		if (!ctx) {
			var canvas = this.getDOMNode();
			if (!canvas) { return; }
			ctx = this.context = canvas.getContext('2d');
		}
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
		return !this.props.frame.equals(nextProps.frame);
	},
	shouldRedraw(prevProps) {
		return prevProps.frame.width  !== this.props.frame.width ||
		       prevProps.frame.height !== this.props.frame.height;
	},
	componentDidUpdate(prevProps, prevState) {
		if (this.shouldRedraw(prevProps)) {
			this.draw();
		}
	},
	componentDidMount() {
		this.draw();
	},
	render() {
		var frame = this.props.frame;
		if (!frame) {
			this.context = null;
			return null;
		}
		return <canvas className="wire" width={frame.width} height={frame.height} style={{left:frame.x+'px', top:frame.y+'px'}} />;
	}
});
module.exports = WWire;