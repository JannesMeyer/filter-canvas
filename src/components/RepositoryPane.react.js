var Constants = require('../flux/Constants');
var RepositoryStore = require('../stores/RepositoryStore');
var RepositoryItem = require('./RepositoryItem.react');

var RepositoryPane = React.createClass({

	getInitialState() {
		return {
			filters: RepositoryStore.getAllFilters(),
			pipes: RepositoryStore.getAllPipes()
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.filters !== nextState.filters ||
		       this.state.pipes   !== nextState.pipes;
	},

	render() {
		var filters = Object.keys(this.state.filters);
		var pipes = Object.keys(this.state.pipes);
		return (
			<div className="m-repository-pane">
				<div className="pipe-repository">
					<h3>Pipes</h3>
					{pipes.map(id => <RepositoryItem key={id} type={Constants.ITEM_TYPE_PIPE} />)}
				</div>
				<div className="filter-repository">
					<h3>Filters</h3>
					{filters.map(id => <RepositoryItem key={id} type={Constants.ITEM_TYPE_FILTER} />)}
					<h3>Complex filters</h3>
					<div>some filters</div>
				</div>
			</div>
		);
	}

});
module.exports = RepositoryPane;