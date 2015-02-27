var { Vector } = require('immutable');
var SelectionStore = require('../stores/SelectionStore');
var WorkbenchStore = require('../stores/WorkbenchStore');
var WorkbenchLayout = require('../WorkbenchLayout');

var WorkbenchItem = require('./WorkbenchItem.react');
var WorkbenchWire = require('./WorkbenchWire.react');

var WorkbenchItems = React.createClass({

	getInitialState() {
		return {
			items: WorkbenchStore.getAllItems(),
			isDragging: WorkbenchStore.isDragging()
		};
	},

	componentDidMount() {
		WorkbenchStore.addPreliminaryPositionListener(this._handleChange);
		WorkbenchStore.addChangeListener(this._handleChange);
		SelectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		WorkbenchStore.removePreliminaryPositionListener(this._handleChange);
		WorkbenchStore.removeChangeListener(this._handleChange);
		SelectionStore.removeChangeListener(this._handleChange);
	},

	render() {
		var wireWidth = WorkbenchLayout.getWireWidth();
		var wires = [];
		var items = [];

		this.state.items.forEach((item, itemId) => {
			// The Vector could be sparse after elements have been deleted from it
			if (!item) { return; }

			var frame = WorkbenchStore.getItemPosition(itemId);
			var isSelected = SelectionStore.isItemSelected(itemId);
			items.push(<WorkbenchItem key={itemId} id={itemId} item={item} frame={frame} isSelected={isSelected} />);

			// Any outputs connected?
			item.get('outputs').forEach((to, outputId) => {
				if (!to) { return; }

				// The "address" of the target connector
				var from = Vector(itemId, 1, outputId);

				var startPoint = WorkbenchStore.getConnectorPosition(from);
				var endPoint = WorkbenchStore.getConnectorPosition(to);
				// TODO: calculate frame and bezier inside the wire
				var frame  = WorkbenchLayout.getConnectionFrame(startPoint, endPoint);
				var bezier = WorkbenchLayout.getBezierPoints(frame, startPoint, endPoint);

				wires.push(<WorkbenchWire key={from.toString()} frame={frame} bezier={bezier} width={wireWidth} />);
			});
		});

		return (
			<div className="m-workbench-items">
				{wires}
				{items}
			</div>
		);
	},

	_handleChange() {
		this.setState(this.getInitialState());
	}

});
module.exports = WorkbenchItems;