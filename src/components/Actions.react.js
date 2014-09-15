var AppActions = require('../flux/AppActions');

var Actions = React.createClass({
	// Show file picker
	handleImport(ev) {
		if (ev.button !== 0) { return; }
		this.refs.fileInput.getDOMNode().click();
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
	handleLoadFile(ev) {

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
	render() {
		return (
			<div className="m-actions">
				<input type="file" className="hidden" onChange={this.handleFileChange} ref="fileInput" />
				<button onClick={this.handleImport}>Import file</button>
				<button onClick={this.handleExport}>Export file</button>
				<button onClick={this.handleUndo}>Undo</button>
				<button onClick={this.handleRedo}>Redo</button>
			</div>
		);
	}
});
module.exports = Actions;