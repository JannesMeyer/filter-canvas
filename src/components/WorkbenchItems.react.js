var WorkbenchStore = require('../flux/WorkbenchStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var SelectionStore = require('../flux/SelectionStore');
var WFilter = require('./WFilter.react');
var WWire = require('./WWire.react');
var Point = require('../lib/ImmutablePoint');
var Rect = require('../lib/ImmutableRect');

var WorkbenchItems = React.createClass({
	_handleChange() {
		this.forceUpdate();
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
		var items = WorkbenchStore.getAllItems();
		var connections = WorkbenchStore.getAllConnections();
		var lineWidth = WorkbenchStore.getWireWidth();
		var isDragging = EtherMovementStore.isDragging();

		return (
			<div className="m-workbench-items">
				{items.map((item, id) => {
					var frame = null;
					var isSelected = SelectionStore.isItemSelected(id);
					if (isSelected && isDragging) {
						frame = EtherMovementStore.getItemPosition(id);
					}
					// TODO: item.type
					return <WFilter key={id} filter={item} frame={frame} isSelected={isSelected} />;
				}).toArray()}

				{connections.map((cn, id) => {
					var fromItem = cn.get('fromItem');
					var fromOffset = cn.get('fromOffset');
					var toItem = cn.get('toItem');
					var toOffset = cn.get('toOffset');

					var isSelected1 = SelectionStore.isItemSelected(fromItem);
					var isSelected2 = SelectionStore.isItemSelected(toItem);

					// TODO: Remove EtherMovementStore
					if (isSelected1 && isDragging) {
						var startPoint = EtherMovementStore.getItemPosition(fromItem).moveBy(fromOffset);
					} else {
						var startPoint = items.getIn([fromItem, 'rect']).moveBy(fromOffset);
					}
					if (isSelected2 && isDragging) {
						var endPoint = EtherMovementStore.getItemPosition(toItem).moveBy(toOffset);
					} else {
						var endPoint = items.getIn([toItem, 'rect']).moveBy(toOffset);
					}
					var frame = calculateFrame(startPoint, endPoint, lineWidth);
					var bezier = calculateBezierPoints(frame, startPoint, endPoint, lineWidth);

					return <WWire key={id} frame={frame} bezier={bezier} width={lineWidth} />;
				}).toArray()}
			</div>
		);
	}
});
module.exports = WorkbenchItems;

function calculateFrame(startPoint, endPoint, lineWidth) {
	var orderedX = startPoint.x < endPoint.x;
	var orderedY = startPoint.y < endPoint.y;
	if (!orderedX) {
		// TODO: draw the wire to a previous location
		return null;
	}
	if (orderedY) {
		return new Rect(
			startPoint.x, startPoint.y,
			endPoint.x - startPoint.x, endPoint.y - startPoint.y + lineWidth
		);
	} else {
		return new Rect(
			startPoint.x, endPoint.y,
			endPoint.x - startPoint.x, startPoint.y - endPoint.y + lineWidth
		);
	}
}

function calculateBezierPoints(frame, startPoint, endPoint, lineWidth) {
	if (frame === null) {
		return null;
	}
	var orderedX = startPoint.x < endPoint.x;
	var orderedY = startPoint.y < endPoint.y;
	if (!orderedX) {
		// TODO: draw the wire to a previous location
		return null;
	}
	var upperY = lineWidth / 2;
	var lowerY = frame.height - lineWidth / 2;
	var middleX = Math.min(0.5 * frame.width, 200);
	var p0, p1, p2, p3;
	if (orderedY) {
		p0 = new Point(0, upperY);
		p1 = new Point(middleX, upperY);
		p2 = new Point(middleX, lowerY);
		p3 = new Point(frame.width, lowerY);
	} else {
		p0 = new Point(0, lowerY);
		p1 = new Point(middleX, lowerY);
		p2 = new Point(middleX, upperY);
		p3 = new Point(frame.width, upperY);
	}
	return [p0, p1, p2, p3];
}