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
		var itemElements = items.map((item, id) => {
			var frame = null;
			var isSelected = SelectionStore.isItemSelected(id);
			if (isSelected && isDragging) {
				frame = EtherMovementStore.getItemPosition(id);
			}

			item.get('outputs').forEach((to, outputIndex) => {
				if (!to) { return; }
				var isOtherSelected = SelectionStore.isItemSelected(to.get(0));

				// TODO: Remove EtherMovementStore
				if (isSelected && isDragging) {
					var frame1 = EtherMovementStore.getItemPosition(id);
				} else {
					var frame1 = WorkbenchStore.getItemPosition(id);
				}
				if (isOtherSelected && isDragging) {
					var frame2 = EtherMovementStore.getItemPosition(to.get(0));
				} else {
					var frame2 = WorkbenchStore.getItemPosition(to.get(0));
				}

				var startPoint = frame1.moveBy(WorkbenchStore.getOutputOffset(id, outputIndex));
				var endPoint = frame2.moveBy(WorkbenchStore.getInputOffset(to.get(0), to.get(1)));
				var frame = WorkbenchLayout.getConnectionFrame(startPoint, endPoint, wireWidth);
				var bezier = WorkbenchLayout.getBezierPoints(frame, startPoint, endPoint, wireWidth);

				wireElements.push(<WorkbenchWire key={id + ',' + outputIndex} frame={frame} bezier={bezier} width={wireWidth} />);
			});

			return <WorkbenchItem key={id} item={item} frame={frame} isSelected={isSelected} />;
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