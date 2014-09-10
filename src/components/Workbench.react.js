var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WFilter = require('./WFilter.react');
var WWire = require('./WWire.react');
var Selection = require('./Selection.react');

var Workbench = React.createClass({
	handleDragOver(ev) {
		ev.preventDefault();
	},
	handleDrop(ev) {
		// Get data
		var data = JSON.parse(ev.dataTransfer.getData('application/json'));

		// Create filter
		var wb = this.getDOMNode();
		var filterX = wb.scrollLeft + ev.clientX - data.clickX;
		var filterY = wb.scrollTop + ev.clientY - data.clickY;
		AppActions.createFilter(data.id, filterX, filterY);
		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();
	},
	handleMouseDown(ev) {
		var node = this.getDOMNode();
		AppActions.startSelection(node.scrollLeft, node.scrollTop, ev);
	},
	render() {
		var filters = WorkbenchStore.getAllFilters();
		var connections = WorkbenchStore.getAllConnections();
		var wireWidth = WorkbenchStore.getWireWidth();

		return (
			<div className="m-workbench" onDragOver={this.handleDragOver} onDrop={this.handleDrop} onMouseDown={this.handleMouseDown}>
				<div className="m-workbench-items">
					{filters.map((_, key) =>
						<WFilter key={key} />
					).toArray()}
					{connections.map((connection, key) =>
						<WWire key={key} connection={connection} width={wireWidth} />
					)}
					<Selection />
				</div>
			</div>
		);
	}
});
module.exports = Workbench;