var RepositoryStore = require('../flux/RepositoryStore');

var RFilter = React.createClass({
	render() {
		var filter = RepositoryStore.getFilter(this.props.key);
		return (
			<div className="m-filter">{this.props.key}</div>
		);
	}
});
module.exports = RFilter;