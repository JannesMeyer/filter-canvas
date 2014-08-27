var RFilter = require('./RFilter.react');
var RPipe = require('./RPipe.react');
var RepositoryStore = require('../flux/RepositoryStore');

var Repository = React.createClass({
	render() {
		var filters = RepositoryStore.getAllFilters();
		var pipes = RepositoryStore.getAllPipes();
		return (
			<div className="m-repository">
				<div className="m-item-container">
					<div className="filter-repository">
						<h3>Filters</h3>
						{filters.map((filter, key) => <RFilter key={key} />).toArray()}
					</div>
					<div className="pipe-repository">
						<h3>Pipes</h3>
						{pipes.map((pipe, key) => <RPipe key={key} />).toArray()}
					</div>
				</div>
			</div>
		);
	}
});
module.exports = Repository;