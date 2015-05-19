import React from 'react';
import cx from 'classnames';
import Rect from '../lib/ImmutableRect';

export default class WorkbenchWire extends React.Component {
	shouldComponentUpdate(nextProps, nextState) {
		return !nextProps.frame.equals(this.props.frame);
	}

	componentDidMount() {
		this.setState({ context: React.findDOMNode(this).getContext('2d') }, () => {
			this.draw();
		});
	}

	componentDidUpdate(prevProps, prevState) {
		if (prevProps.frame.width  !== this.props.frame.width ||
		    prevProps.frame.height !== this.props.frame.height) {
			this.draw();
		}
	}

	draw() {
		var ctx = this.state.context;
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
	}

	render() {
		var dragging = this.props.dragging;
		var frame = this.props.frame;

		return <canvas className={cx('m-wire', { dragging })}
		               style={{ left: frame.x, top: frame.y }}
		               width={frame.width}
		               height={frame.height} />;
	}
}