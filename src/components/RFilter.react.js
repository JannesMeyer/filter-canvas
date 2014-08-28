var RepositoryStore = require('../flux/RepositoryStore');

var RFilter = React.createClass({
	handleMouseDown(e) {
		console.log(this.props.key);
	},
	render() {
		var filter = RepositoryStore.getFilter(this.props.key);
		return (
			<div className="m-filter" onMouseDown={this.handleMouseDown}>{this.props.key}</div>
		);
	}
});
module.exports = RFilter;