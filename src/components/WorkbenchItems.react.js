var SelectionStore = require('../flux/SelectionStore');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var WorkbenchItem = require('./WorkbenchItem.react');
var WorkbenchWire = require('./WorkbenchWire.react');

module.exports = React.createClass({

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
					// This particular output is not connected yet
					return;
				}
				// The "address" of the target connector
				var from = [itemId, 1, outputId];

				var filterPos1 = WorkbenchStore.getItemPosition(from[0]);
				var filterPos2 = WorkbenchStore.getItemPosition(to[0]);
				var startPoint = filterPos1.moveBy(WorkbenchStore.getConnectorOffset(from));
				var endPoint   = filterPos2.moveBy(WorkbenchStore.getConnectorOffset(to));

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