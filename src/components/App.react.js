var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');

var App = React.createClass({
	render() {
		return (
			<div className="m-container">
				<Workbench />
				<Repository />
			</div>
		);
	}
});
module.exports = App;