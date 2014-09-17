var constants = require('../flux/constants');
var RepositoryStore = require('../flux/RepositoryStore');
var RepositoryItem = require('./RepositoryItem.react');

module.exports = React.createClass({

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

	componentDidMount() {
		RepositoryStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		RepositoryStore.removeChangeListener(this._handleChange);
	},

	render() {
		var filters = Object.keys(this.state.filters);
		var pipes = Object.keys(this.state.pipes);
		return (
			<div className="m-repository-pane">
				<div className="filter-repository">
					<h3>Filters</h3>
					{filters.map(id => <RepositoryItem key={id} type={constants.ITEM_TYPE_FILTER} />)}
				</div>
				<div className="pipe-repository">
					<h3>Pipes</h3>
					{pipes.map(id => <RepositoryItem key={id} type={constants.ITEM_TYPE_PIPE} />)}
				</div>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});