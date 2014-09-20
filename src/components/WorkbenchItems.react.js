var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var WorkbenchStore = require('../flux/WorkbenchStore');
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

			var outputs = item.get('outputs');
			outputs.forEach((to, outputIndex) => {
				if (!to) { return; }
				var otherItem = WorkbenchStore.getItem(to.get(0));
				var isOtherSelected = SelectionStore.isItemSelected(to.get(0));

				// TODO: Remove EtherMovementStore
				if (isSelected && isDragging) {
					var startPoint = EtherMovementStore.getItemPosition(itemId);
				} else {
					var startPoint = WorkbenchStore.getItemPosition(itemId);
				}
				if (isOtherSelected && isDragging) {
					var endPoint = EtherMovementStore.getItemPosition(to.get(0));
				} else {
					var endPoint = WorkbenchStore.getItemPosition(to.get(0));
				}

				startPoint = startPoint.moveBy(WorkbenchLayout.getConnectorOffset(startPoint, outputs.length, outputIndex, true));
				endPoint = endPoint.moveBy(WorkbenchLayout.getConnectorOffset(endPoint, otherItem.get('inputs').length, to.get(1), false));

				var frame = WorkbenchLayout.getConnectionFrame(startPoint, endPoint, wireWidth);
				var bezier = WorkbenchLayout.getBezierPoints(frame, startPoint, endPoint, wireWidth);

				wireElements.push(<WorkbenchWire key={itemId + '.' + outputIndex} frame={frame} bezier={bezier} width={wireWidth} />);
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