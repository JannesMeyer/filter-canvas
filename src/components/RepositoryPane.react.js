var Constants = require('../flux/Constants');
var AppActions = require('../flux/AppActions');
var RepositoryStore = require('../stores/RepositoryStore');
var RepositoryItem = require('./RepositoryItem.react');

function isEmptyObject(obj) {
	for (var name in obj) {
		return false;
	}
	return true;
}

var RepositoryPane = React.createClass({

	getInitialState() {
		return {
			pipes: RepositoryStore.getAllPipes(),
			filters: RepositoryStore.getAllFilters(),
			complexFilters: RepositoryStore.getAllComplexFilters()
		};
	},

	componentDidMount() {
		RepositoryStore.addChangeListener(this._handleChange);
		AppActions.reloadRepository();
	},

	componentWillUnmount() {
		RepositoryStore.removeChangeListener(this._handleChange);
	},

	render() {
		var spinner = (
			<div className="spinner">
			  <div className="rect1"></div>
			  <div className="rect2"></div>
			  <div className="rect3"></div>
			  <div className="rect4"></div>
			  <div className="rect5"></div>
			</div>
		);

		var pipes;
		var filters;
		var complexFilters;

		if (!this.state.pipes) {
			pipes = spinner;
		} else if(isEmptyObject(this.state.pipes)) {
			pipes = <p>Noch keine Daten</p>;
		} else {
			pipes = Object.keys(this.state.pipes).map(id => {
				return <RepositoryItem key={id} type={Constants.ITEM_TYPE_PIPE} />;
			});
		}

		if (!this.state.filters) {
			filters = spinner;
		} else if(isEmptyObject(this.state.filters)) {
			pipes = <p>Noch keine Daten</p>;
		} else {
			filters = Object.keys(this.state.filters).map(id => {
				return <RepositoryItem key={id} type={Constants.ITEM_TYPE_FILTER} />;
			});
		}

		if (!this.state.complexFilters) {
			complexFilters = spinner;
		} else if(isEmptyObject(this.state.complexFilters)) {
			complexFilters = <p>Noch keine Daten</p>;
		} else {
			complexFilters = [];
		}

		return (
			<div className="m-repository-pane">
				<div className="pipe-repository">
					<h3>Pipes</h3>
					{pipes}
				</div>
				<div className="filter-repository">
					<h3>Filter</h3>
					{filters}
				</div>
				<div className="complex-filter-repository">
					<h3>Komplexe Filter</h3>
					{complexFilters}
				</div>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = RepositoryPane;