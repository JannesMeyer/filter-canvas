var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var keypress = require('../lib/keypress-tool');

var Actions = React.createClass({

	getInitialState() {
		return {
			undoSteps: WorkbenchStore.hasUndoSteps(),
			redoSteps: WorkbenchStore.hasRedoSteps()
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.undoSteps !== nextState.undoSteps ||
		       this.state.redoSteps !== nextState.redoSteps;
	},

	pickImportFile() {
		this.refs.fileInput.getDOMNode().click();
	},

	handleImport(ev) {
		if (ev.button !== 0) { return; }
		this.pickImportFile();
	},

	handleFileChange(ev) {
		var files = this.refs.fileInput.getDOMNode().files;
		if (files.length === 0) {
			return;
		}
		if (files[0].type !== 'application/json') {
			return alert('Please select a JSON file.');
		}

		// Read JSON file
		var reader = new FileReader();
		reader.addEventListener('load', function(ev) {
			var importObj;
			try {
				importObj = JSON.parse(reader.result);
			} catch (err) {
				return alert('JSON syntax error:\n\n' + err.message);
			}
			AppActions.importFile(importObj);
		});
		reader.readAsText(files[0]);
	},

	handleExport(ev) {
		if (ev.button !== 0) { return; }
		AppActions.exportFile();
	},

	handleUndo(ev) {
		if (ev.button !== 0) { return; }
		AppActions.undo();
	},

	handleRedo(ev) {
		if (ev.button !== 0) { return; }
		AppActions.redo();
	},

	componentDidMount() {
		WorkbenchStore.addChangeListener(this._handleChange);
		keypress.on('o', ['ctrl'],         this.pickImportFile);
		keypress.on('s', ['ctrl'],         AppActions.exportFile);
		keypress.on('z', ['ctrl'],         AppActions.undo);
		keypress.on('z', ['ctrl','shift'], AppActions.redo);
		keypress.on('y', ['ctrl'],         AppActions.redo);
	},

	componentWillUnmount() {
		WorkbenchStore.removeChangeListener(this._handleChange);
		keypress.off('o', ['ctrl'],         this.pickImportFile);
		keypress.off('s', ['ctrl'],         AppActions.exportFile);
		keypress.off('z', ['ctrl'],         AppActions.undo);
		keypress.off('z', ['ctrl','shift'], AppActions.redo);
		keypress.off('y', ['ctrl'],         AppActions.redo);
	},

	render() {
		return (
			<div className="m-actions">
				<input type="file" className="hidden" onChange={this.handleFileChange} ref="fileInput" />
				<button onClick={this.handleImport}>Import file</button>
				<button onClick={this.handleExport}>Export file</button>
				<button onClick={this.handleUndo} disabled={!this.state.undoSteps}>Undo</button>
				<button onClick={this.handleRedo} disabled={!this.state.redoSteps}>Redo</button>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = Actions;