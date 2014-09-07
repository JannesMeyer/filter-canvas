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
		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();

		// Get data
		var data = JSON.parse(ev.dataTransfer.getData('application/json'));

		// Create filter
		var containerBounds = this.refs.itemsContainer.getDOMNode().getBoundingClientRect();
		var x = ev.clientX - data.clickX - containerBounds.left;
		var y = ev.clientY - data.clickY - containerBounds.top;
		AppActions.createFilter(data.id, x, y);
	},
	handleMouseDown(ev) {
		ev.stopPropagation();
		ev.preventDefault();
		AppActions.startSelection(ev.clientX, ev.clientY);
	},
	render() {
		var filters = WorkbenchStore.getAllFilters();
		var connections = WorkbenchStore.getAllConnections();
		var wireWidth = WorkbenchStore.getWireWidth();

		return (
			<div className="m-workbench" onDragOver={this.handleDragOver} onDrop={this.handleDrop} onMouseDown={this.handleMouseDown}>
				<div className="m-workbench-items" ref="itemsContainer">
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