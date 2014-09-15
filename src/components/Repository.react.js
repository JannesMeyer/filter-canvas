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
						{filters.map((_, key) => <RFilter key={key} />).toArray()}
					</div>
					<div className="pipe-repository">
						<h3>Pipes</h3>
						{pipes.map((_, key) => <RPipe key={key} />).toArray()}
					</div>
				</div>
				<DetailPane />
			</div>
		);
	}
});
module.exports = Repository;