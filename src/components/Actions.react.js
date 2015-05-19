import keypress from '../lib/keypress-tool';
import React from 'react';
import translate from 'counterpart';
import AppActions from '../flux/AppActions';
import WorkbenchStore from '../stores/WorkbenchStore';
import LanguageStore from '../stores/LanguageStore';

var Actions = React.createClass({

	getInitialState() {
		return {
			hasUndoSteps: WorkbenchStore.hasUndoSteps(),
			hasRedoSteps: WorkbenchStore.hasRedoSteps()
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.hasUndoSteps !== nextState.hasUndoSteps ||
		       this.state.hasRedoSteps !== nextState.hasRedoSteps;
	},

	selectFile() {
		this.refs.file.getDOMNode().click();
	},

	handleFileChange(ev) {
		var files = this.refs.file.getDOMNode().files;
		if (files.length === 0) {
			return;
		}

		// Setup
		var reader = new FileReader();
		reader.addEventListener('load', this.handleFileLoaded);

		// Read file
		reader.readAsText(files[0]);
	},

	handleFileLoaded(ev) {
		var reader = ev.currentTarget;
		try {
			AppActions.importFile(reader.result);
			// Reset file input field
			this.refs.file.getDOMNode().value = '';
		} catch (err) {
			alert(translate('errors.invalid_file', { message: err.message }));
		}
	},

	componentDidMount() {
		this.forceUpdate = this.forceUpdate.bind(this);
		LanguageStore.addChangeListener(this.forceUpdate);
		WorkbenchStore.addChangeListener(this._handleChange);
		keypress.on('o', ['ctrl'],         this.selectFile);
		keypress.on('s', ['ctrl'],         AppActions.exportFile);
		keypress.on('z', ['ctrl'],         AppActions.undo);
		keypress.on('z', ['ctrl','shift'], AppActions.redo);
		keypress.on('y', ['ctrl'],         AppActions.redo);
	},

	componentWillUnmount() {
		LanguageStore.removeChangeListener(this.forceUpdate);
		WorkbenchStore.removeChangeListener(this._handleChange);
		keypress.off('o', ['ctrl'],         this.selectFile);
		keypress.off('s', ['ctrl'],         AppActions.exportFile);
		keypress.off('z', ['ctrl'],         AppActions.undo);
		keypress.off('z', ['ctrl','shift'], AppActions.redo);
		keypress.off('y', ['ctrl'],         AppActions.redo);
	},

	render() {
		return (
			<div className="m-actions">
				<input className="hidden" type="file" ref="file" accept="application/json" onChange={this.handleFileChange} />
				<button onClick={AppActions.deleteAllItems} className="icon icon-doc-inv">{translate('actions.new')}</button>
				<button onClick={this.selectFile} className="icon icon-open">{translate('actions.import')}</button>
				<button onClick={AppActions.exportFile} className="icon icon-save">{translate('actions.export')}</button>
				<button onClick={AppActions.undo} className="icon icon-undo" disabled={!this.state.hasUndoSteps}>{translate('actions.undo')}</button>
				<button onClick={AppActions.redo} className="icon icon-redo" disabled={!this.state.hasRedoSteps}>{translate('actions.redo')}</button>
			</div>
		);
	},

	_handleChange() {
		this.setState(this.getInitialState());
	}

});
export default Actions;