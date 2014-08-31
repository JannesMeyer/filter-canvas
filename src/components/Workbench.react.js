var WorkbenchStore = require('../flux/WorkbenchStore');
var WFilter = require('./WFilter.react');
var WWire = require('./WWire.react');

var Workbench = React.createClass({
	render() {
		var filters = WorkbenchStore.getAllFilters();
		var connections = WorkbenchStore.getAllConnections();
		var wireWidth = WorkbenchStore.getWireWidth();

		return (
			<div className="m-workbench">
				{filters.map((_, key) =>
					<WFilter key={key} />
				).toArray()}

				{connections.map((connection, key) =>
					<WWire key={key} connection={connection} width={wireWidth} />
				).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;