var cx = require('react/lib/cx');
var Rect = require('../lib/ImmutableRect');

var WorkbenchWire = React.createClass({

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
		// TODO: fix these weird conditions
		return this.props.frame &&
		       nextProps.frame &&
		       !this.props.frame.equals(nextProps.frame) ||
		       this.props.dragging !== nextProps.dragging;
	},

	shouldComponentRedraw(prevProps) {
		return prevProps.frame.width  !== this.props.frame.width ||
		       prevProps.frame.height !== this.props.frame.height;
	},

	componentDidUpdate(prevProps, prevState) {
		// TODO: fix these weird conditions
		if (this.props.bezier && prevProps.bezier && this.shouldComponentRedraw(prevProps)) {
			this.draw();
		}
	},

	componentDidMount() {
		// TODO: fix these weird conditions
		if (this.props.bezier) {
			this.draw();
		}
	},

	render() {
		var frame = this.props.frame || Rect.Zero;
		var isDragging = this.props.dragging;

		var classes = cx({
			'm-wire': true,
			'dragging': (isDragging === true),
			'hidden': (isDragging === false)
		});
		var style = {
			left: frame.x,
			top: frame.y
		};
		return <canvas className={classes} width={frame.width} height={frame.height} style={style} />;
	}

});
module.exports = WorkbenchWire;