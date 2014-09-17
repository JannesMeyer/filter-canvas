var RepositoryStore = require('../flux/RepositoryStore');
var constants = require('../flux/constants');

var RItem = require('./RItem.react');
var DetailPane = require('./DetailPane.react');

var Repository = React.createClass({

	render() {
		var filters = RepositoryStore.getAllFilters();
		var pipes = RepositoryStore.getAllPipes();
		return (
			<div className="m-sidebar">
				<div className="m-repository-pane">
					<div className="filter-repository">
						<h3>Filters</h3>
						{Object.keys(filters).map(key => <RItem key={key} type={constants.ITEM_TYPE_FILTER} />)}
					</div>
					<div className="pipe-repository">
						<h3>Pipes</h3>
						{Object.keys(pipes).map(key => <RItem key={key} type={constants.ITEM_TYPE_PIPE} />)}
					</div>
				</div>
				<DetailPane />
			</div>
		);
	}

});
module.exports = Repository;