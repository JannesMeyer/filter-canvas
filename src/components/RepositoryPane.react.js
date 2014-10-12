var Constants = require('../flux/Constants');
var AppActions = require('../flux/AppActions');
var RepositoryStore = require('../stores/RepositoryStore');
var RepositoryItem = require('./RepositoryItem.react');

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
		var pipes = this.state.pipes;
		var filters = this.state.filters;
		var complexFilters = this.state.complexFilters;

		var spinner = (
			<div className="spinner">
			  <div className="rect1"></div>
			  <div className="rect2"></div>
			  <div className="rect3"></div>
			  <div className="rect4"></div>
			  <div className="rect5"></div>
			</div>
		);
		var pipeContent = spinner;
		var filterContent = spinner;
		var complexFilterContent = spinner;

		if(pipes instanceof Error) {
			pipeContent = <p>Verbindungs-Fehler</p>;
		} else
		if (pipes !== null) {
			pipeContent = Object.keys(pipes).map(id => {
				return <RepositoryItem key={id} type={Constants.ITEM_TYPE_PIPE} />;
			});
		}

		if(filters instanceof Error) {
			filterContent = <p>Verbindungs-Fehler</p>;
		} else
		if (filters !== null) {
			filterContent = Object.keys(filters).map(id => {
				return <RepositoryItem key={id} type={Constants.ITEM_TYPE_FILTER} />;
			});
		}

		if(complexFilters instanceof Error) {
			complexFilterContent = <p>Verbindungs-Fehler</p>;
		} else
		if (complexFilters !== null) {
			complexFilterContent = [];
		}

		return (
			<div className="m-repository-pane">
				<div className="pipe-repository">
					<h3>Pipes</h3>
					{pipeContent}
				</div>
				<div className="filter-repository">
					<h3>Filter</h3>
					{filterContent}
				</div>
				<div className="complex-filter-repository">
					<h3>Komplexe Filter</h3>
					{complexFilterContent}
				</div>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = RepositoryPane;