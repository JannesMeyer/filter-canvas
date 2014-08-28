var WorkbenchStore = require('../flux/WorkbenchStore');
var WFilter = require('./WFilter.react');

var Workbench = React.createClass({
	render() {
		var filters = WorkbenchStore.getAllFilters();
		return (
			<div className="m-workbench">
				{filters.map((filter, key) =>
					<WFilter key={key} />
				).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;