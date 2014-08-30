var WorkbenchStore = require('../flux/WorkbenchStore');
var WFilter = require('./WFilter.react');
var WWire = require('./WWire.react');

var Workbench = React.createClass({
	render() {
		var filters = WorkbenchStore.getAllFilters();
		return (
			<div className="m-workbench">
				{filters.map((filter, key) =>
					<WFilter key={key} />
				).toArray()}
				<WWire wire={WorkbenchStore.getWire(0)} lineWidth={WorkbenchStore.getWireWidth()} />
			</div>
		);
	}
});
module.exports = Workbench;