var	CreateConnectionStore = require('../flux/CreateConnectionStore');
var WorkbenchLayout = require('../interface/WorkbenchLayout');
var Point = require('../lib/ImmutablePoint');

var WorkbenchWire = require('./WorkbenchWire.react');

module.exports = React.createClass({

	getInitialState() {
		return {
			startPoint: new Point(0, 0),
			endPoint: new Point(200, 200),
			active: CreateConnectionStore.isDragging()
		};
	},

	componentDidMount() {
		CreateConnectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		CreateConnectionStore.removeChangeListener(this._handleChange);
	},

	render() {
		var state = this.state;

		var frame = WorkbenchLayout.getConnectionFrame(state.startPoint, state.endPoint);
		var bezier = WorkbenchLayout.getBezierPoints(frame, state.startPoint, state.endPoint);
		var wireWidth = WorkbenchLayout.getWireWidth();
		return <WorkbenchWire dragging={state.active} frame={frame} bezier={bezier} width={wireWidth} />;
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});