var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WPath = require('../lib/WPath');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var WorkbenchItem = require('./WorkbenchItem.react');
var WorkbenchWire = require('./WorkbenchWire.react');

module.exports = React.createClass({

	getInitialState() {
		return {
			items: WorkbenchStore.getAllItems(),
			wireWidth: WorkbenchLayout.getWireWidth(),
			isDragging: EtherMovementStore.isDragging()
		};
	},

	componentDidMount() {
		WorkbenchStore.addChangeListener(this._handleChange);
		EtherMovementStore.addChangeListener(this._handleChange);
		SelectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		WorkbenchStore.removeChangeListener(this._handleChange);
		EtherMovementStore.removeChangeListener(this._handleChange);
		SelectionStore.removeChangeListener(this._handleChange);
	},

	render() {
		var items = this.state.items.toArray();
		var wireWidth = this.state.wireWidth;
		var isDragging = this.state.isDragging;

		var wireElements = [];
		var itemElements = items.map((item, itemId) => {
			var frame = null;
			var isSelected = SelectionStore.isItemSelected(itemId);
			if (isSelected && isDragging) {
				frame = EtherMovementStore.getItemPosition(itemId);
			}

			var from = new WPath(itemId, 1);
			item.get('outputs').forEach((to, fromConnector) => {
				if (!to) {
					return;
				}

				// Enhance the path object
				from.connector = fromConnector;

				// TODO: Remove EtherMovementStore
				if (isSelected && isDragging) {
					var frame1 = EtherMovementStore.getItemPosition(itemId);
				} else {
					var frame1 = WorkbenchStore.getItemPosition(itemId);
				}

				var isOtherSelected = SelectionStore.isItemSelected(to.item);
				if (isOtherSelected && isDragging) {
					var frame2 = EtherMovementStore.getItemPosition(to.item);
				} else {
					var frame2 = WorkbenchStore.getItemPosition(to.item);
				}

				var startPoint = frame1.moveBy(WorkbenchStore.getConnectorOffset(from));
				var endPoint = frame2.moveBy(WorkbenchStore.getConnectorOffset(to));
				var frame = WorkbenchLayout.getConnectionFrame(startPoint, endPoint, wireWidth);
				var bezier = WorkbenchLayout.getBezierPoints(frame, startPoint, endPoint, wireWidth);

				wireElements.push(<WorkbenchWire key={from.toString()} frame={frame} bezier={bezier} width={wireWidth} />);
			});

			return <WorkbenchItem key={itemId} item={item} frame={frame} isSelected={isSelected} />;
		});

		return (
			<div className="m-workbench-items">
				{wireElements}
				{itemElements}
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});