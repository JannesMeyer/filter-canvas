import React from 'react';
import WorkbenchWire from './WorkbenchWire.react';
import WorkbenchLayout from '../WorkbenchLayout';
import Point from '../lib/ImmutablePoint';
import CreateConnectionStore from '../stores/CreateConnectionStore';

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

		if (!state.active) {
			return null;
		}

		var wireWidth = WorkbenchLayout.getWireWidth();
		var frame = WorkbenchLayout.getConnectionFrame(state.startPoint, state.endPoint);
		var bezier = WorkbenchLayout.getBezierPoints(frame, state.startPoint, state.endPoint);
		return <WorkbenchWire dragging={true} frame={frame} bezier={bezier} width={wireWidth} />;
	},

	_handleChange() {
		this.setState(this.getInitialState());
	}

});
export default CreateConnection;