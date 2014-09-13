var WorkbenchStore = require('../flux/WorkbenchStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var SelectionStore = require('../flux/SelectionStore');
var WFilter = require('./WFilter.react');
var WWire = require('./WWire.react');
var Point = require('../lib/ImmutablePoint');
var Rect = require('../lib/ImmutableRect');

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
		var filters = WorkbenchStore.getAllFilters();
		var connections = WorkbenchStore.getAllConnections();
		var lineWidth = WorkbenchStore.getWireWidth();
		var isDragging = EtherMovementStore.isDragging();

		return (
			<div className="m-workbench-items">
				{filters.map((filter, id) => {
					var frame = null;
					var isSelected = SelectionStore.isItemSelected('Filter', id);
					if (isSelected && isDragging) {
						frame = EtherMovementStore.getItemPosition(id);
					}
					return <WFilter key={id} filter={filter} frame={frame} isSelected={isSelected} />;
				}).toArray()}

				{connections.map((con, id) => {
					var isSelected1 = SelectionStore.isItemSelected('Filter', con.fromFilter);
					var isSelected2 = SelectionStore.isItemSelected('Filter', con.toFilter);

					if (isSelected1 && isDragging) {
						var startPoint = EtherMovementStore.getItemPosition(con.fromFilter).moveBy(con.fromOffset);
					} else {
						var startPoint = filters.getIn([con.fromFilter, 'rect']).moveBy(con.fromOffset);
					}
					if (isSelected2 && isDragging) {
						var endPoint = EtherMovementStore.getItemPosition(con.toFilter).moveBy(con.toOffset);
					} else {
						var endPoint = filters.getIn([con.toFilter, 'rect']).moveBy(con.toOffset);
					}
					var frame = calculateFrame(startPoint, endPoint, lineWidth);
					var bezier = calculateBezierPoints(frame, startPoint, endPoint, lineWidth);

					return <WWire key={id} frame={frame} bezier={bezier} width={lineWidth} />;
				})}
			</div>
		);
	}
});
module.exports = WorkbenchItems;