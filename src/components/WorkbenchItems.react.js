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
			connections: WorkbenchStore.getAllConnections(),
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
		var connections = this.state.connections.toArray();

		return (
			<div className="m-workbench-items">
				{items.map((item, id) => {
					var frame = null;
					var isSelected = SelectionStore.isItemSelected(id);
					if (isSelected && this.state.isDragging) {
						frame = EtherMovementStore.getItemPosition(id);
					}
					return <WorkbenchItem key={id} item={item} frame={frame} isSelected={isSelected} />;
				})}
				{connections.map((cn, id) => {
					var fromItem = cn.get('fromItem');
					var fromOffset = cn.get('fromOffset');
					var toItem = cn.get('toItem');
					var toOffset = cn.get('toOffset');

					var isSelected1 = SelectionStore.isItemSelected(fromItem);
					var isSelected2 = SelectionStore.isItemSelected(toItem);

					// TODO: Remove EtherMovementStore
					if (isSelected1 && this.state.isDragging) {
						var startPoint = EtherMovementStore.getItemPosition(fromItem).moveBy(fromOffset);
					} else {
						var startPoint = items[fromItem].get('rect').moveBy(fromOffset);
					}
					if (isSelected2 && this.state.isDragging) {
						var endPoint = EtherMovementStore.getItemPosition(toItem).moveBy(toOffset);
					} else {
						var endPoint = items[toItem].get('rect').moveBy(toOffset);
					}
					var frame = WorkbenchLayout.getConnectionFrame(startPoint, endPoint, this.state.wireWidth);
					var bezier = WorkbenchLayout.getBezierPoints(frame, startPoint, endPoint, this.state.wireWidth);

					return <WorkbenchWire key={id} frame={frame} bezier={bezier} width={this.state.wireWidth} />;
				})}
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});