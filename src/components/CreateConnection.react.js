var	CreateConnectionStore = require('../flux/CreateConnectionStore');
var WorkbenchLayout = require('../interface/WorkbenchLayout');
var Point = require('../lib/ImmutablePoint');

var WorkbenchWire = require('./WorkbenchWire.react');

var CreateConnection = React.createClass({

	getInitialState() {
		var {startPoint, endPoint} = CreateConnectionStore.getPoints();
		return {
			startPoint,
			endPoint,
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

		var wireWidth = WorkbenchLayout.getWireWidth();
		var frame = WorkbenchLayout.getConnectionFrame(state.startPoint, state.endPoint);
		var bezier = WorkbenchLayout.getBezierPoints(frame, state.startPoint, state.endPoint);
		return <WorkbenchWire dragging={state.active} frame={frame} bezier={bezier} width={wireWidth} />;
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = CreateConnection;