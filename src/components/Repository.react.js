var RepositoryStore = require('../flux/RepositoryStore');

var RFilter = require('./RFilter.react');
var RPipe = require('./RPipe.react');
var DetailPane = require('./DetailPane.react');

var Repository = React.createClass({
	render() {
		var filters = RepositoryStore.getAllFilters();
		var pipes = RepositoryStore.getAllPipes();
		return (
			<div className="m-repository">
				<div className="m-item-container">
					<div className="filter-repository">
						<h3>Filters</h3>
						{Object.keys(filters).map(key => <RFilter key={key} />)}
					</div>
					<div className="pipe-repository">
						<h3>Pipes</h3>
						{Object.keys(pipes).map(key => <RPipe key={key} />)}
					</div>
				</div>
				<DetailPane />
			</div>
		);
	}
});
module.exports = Repository;