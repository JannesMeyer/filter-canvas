import React from 'react';
import translate from 'counterpart';
import LanguageStore from '../stores/LanguageStore';
import immutable from 'immutable';
import Constants from '../flux/Constants';
import AppActions from '../flux/AppActions';
import RepositoryStore from '../stores/RepositoryStore';
import RepositoryItem from './RepositoryItem.react';

const LANGUAGES = Array.from(LanguageStore.getAllLanguages());

var RepositoryPane = React.createClass({

	getInitialState() {
		return {
			pipes: RepositoryStore.getAllPipes(),
			filters: RepositoryStore.getAllFilters()
			// complexFilters: RepositoryStore.getAllComplexFilters()
		};
	},

	componentDidMount() {
		this.forceUpdate = this.forceUpdate.bind(this);
		LanguageStore.addChangeListener(this.forceUpdate);
		RepositoryStore.addChangeListener(this._handleChange);

		// Load the data via AJAX
		AppActions.reloadRepository();
	},

	componentWillUnmount() {
		LanguageStore.removeChangeListener(this.forceUpdate);
		RepositoryStore.removeChangeListener(this._handleChange);
	},

	handleLanguageChange(ev) {
		AppActions.changeLanguage(ev.target.value);
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
		var sourcesContent = spinner;
		var filtersContent = spinner;
		var sinksContent = spinner;
		var complexFilterContent = spinner;

		if(pipes instanceof Error) {
			pipeContent = <p>{translate('errors.no_network')}</p>;
		} else
		if (pipes !== null) {
			pipeContent = Object.keys(pipes).map(id => {
				return <RepositoryItem key={id} id={id} type={Constants.ITEM_TYPE_PIPE} />;
			});
		}

		if(filters instanceof Error) {
			sourcesContent = <p>{translate('errors.no_network')}</p>;
			filtersContent = <p>{translate('errors.no_network')}</p>;
			sinksContent = <p>{translate('errors.no_network')}</p>;
		} else
		if (filters !== null) {
			filters = immutable.Map(filters);
			sourcesContent = filters.filter(f => f.inputs === 0).map((_, id) => {
				return <RepositoryItem key={id} id={id} type={Constants.ITEM_TYPE_FILTER} />;
			}).toArray();
			filtersContent = filters.filter(f => f.inputs !== 0 && f.outputs !== 0).map((_, id) => {
				return <RepositoryItem key={id} id={id} type={Constants.ITEM_TYPE_FILTER} />;
			}).toArray();
			sinksContent = filters.filter(f => f.outputs === 0).map((_, id) => {
				return <RepositoryItem key={id} id={id} type={Constants.ITEM_TYPE_FILTER} />;
			}).toArray();
		}

		// if(complexFilters instanceof Error) {
		// 	complexFilterContent = <p>{translate('errors.no_network')}</p>;
		// } else
		// if (complexFilters !== null) {
		// 	complexFilterContent = [];
		// }

		// <h3>{translate('repository_pane.complex_filters')}</h3>
		// {complexFilterContent}

		return (
			<div className="m-repository-pane">
				<select className="m-language-selector" defaultValue={LanguageStore.getLanguage()} onChange={this.handleLanguageChange}>
				{LANGUAGES.map(([id, name]) =>
					<option value={id} key={id}>{name}</option>
				)}
				</select>
				<p className="introduction">{translate('introduction_1')}</p>
				<p className="introduction">{translate('introduction_2')}</p>
				<div className="pipe-repository">
					<h3>{translate('repository_pane.pipes')}</h3>
					{pipeContent}
				</div>
				<div className="filter-repository">
					<h3>{translate('repository_pane.pumps')}</h3>
					{sourcesContent}
					<h3>{translate('repository_pane.filters')}</h3>
					{filtersContent}
					<h3>{translate('repository_pane.sinks')}</h3>
					{sinksContent}
				</div>
			</div>
		);
	},

	_handleChange() {
		this.setState(this.getInitialState());
	}

});
export default RepositoryPane;