var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var keypress = require('../lib/keypress-tool');

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
		} catch (err) {
			alert('Ungültige Datei\n\n' + err.message);
		}
	},

	componentDidMount() {
		WorkbenchStore.addChangeListener(this._handleChange);
		keypress.on('o', ['ctrl'],         this.selectFile);
		keypress.on('s', ['ctrl'],         AppActions.exportFile);
		keypress.on('z', ['ctrl'],         AppActions.undo);
		keypress.on('z', ['ctrl','shift'], AppActions.redo);
		keypress.on('y', ['ctrl'],         AppActions.redo);
	},

	componentWillUnmount() {
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
				<button onClick={AppActions.deleteAllItems}>Neu</button>
				<button onClick={this.selectFile} className="icon icon-open">Importieren</button>
				<button onClick={AppActions.exportFile} className="icon icon-save">Exportieren</button>
				<button onClick={AppActions.undo} className="icon icon-undo" disabled={!this.state.hasUndoSteps}>Rückgängig</button>
				<button onClick={AppActions.redo} className="icon icon-redo" disabled={!this.state.hasRedoSteps}>Wiederholen</button>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = Actions;