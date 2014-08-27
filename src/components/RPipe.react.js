var RepositoryStore = require('../flux/RepositoryStore');

var RFilter = React.createClass({
	render() {
		var filter = RepositoryStore.getPipe(this.props.key);
		return (
			<div className="m-pipe">{this.props.key}</div>
		);
	}
});
module.exports = RFilter;