var { Vector } = require('immutable');
var SelectionStore = require('../flux/SelectionStore');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

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
		WorkbenchStore.addChangeListener(this._handleChange);
		SelectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		WorkbenchStore.removeChangeListener(this._handleChange);
		SelectionStore.removeChangeListener(this._handleChange);
	},

	render() {
		var wireWidth = WorkbenchLayout.getWireWidth();
		var wires = [];
		var items = [];

		this.state.items.forEach((item, itemId) => {
			var frame = WorkbenchStore.getItemPosition(itemId);
			var isSelected = SelectionStore.isItemSelected(itemId);
			items.push(<WorkbenchItem key={itemId} item={item} frame={frame} isSelected={isSelected} />);

			// Any outputs connected?
			item.get('outputs').forEach((to, outputId) => {
				if (!to) {
					return;
				}
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
		this.replaceState(this.getInitialState());
	}

});
module.exports = WorkbenchItems;