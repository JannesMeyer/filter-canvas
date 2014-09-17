var AppActions = require('../flux/AppActions');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var keypress = require('../lib/keypress-tool');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');
var Actions = require('./Actions.react');

var App = React.createClass({

	handleMouseMove(ev) {
		if (EtherMovementStore.isDragging()) {
			AppActions.moveSelectedItems(ev.clientX, ev.clientY);
		} else if (SelectionStore.isSelecting()) {
			AppActions.resizeSelection(ev.clientX, ev.clientY);
		}
	},

	handleMouseUp(ev) {
		if (ev.button !== 0) { return; }

		if (EtherMovementStore.isDragging()) {
			AppActions.finishMovingSelectedItems(ev);
		} else if (SelectionStore.isSelecting()) {
			AppActions.finishSelection(ev);
		}
	},

	handleUnload(ev) {
		var message = 'You have unsaved changes.';
		ev.returnValue = message;
		return message;
	},

	componentDidMount() {
		// Register global event handlers
		addEventListener('mousemove', this.handleMouseMove);
		addEventListener('mouseup',   this.handleMouseUp);
		keypress.on('backspace',           AppActions.deleteSelectedItems);
		keypress.on('del',                 AppActions.deleteSelectedItems);
		keypress.on('z', ['ctrl'],         AppActions.undo);
		keypress.on('z', ['ctrl','shift'], AppActions.redo);
		keypress.on('y', ['ctrl'],         AppActions.redo);
		keypress.on('a', ['ctrl'],         AppActions.selectAll);
		keypress.on('esc',                 AppActions.cancel);
		keypress.on('s', ['ctrl'],         AppActions.exportFile);
		// TODO: what about the file picker?
		keypress.on('o', ['ctrl'],         AppActions.importFile);
		// TODO: left, right, up, down

		// TODO: save architecture in localstorage
		// addEventListener('beforeunload', this.handleUnload);
		// TODO: check for unsaved changes
		// TODO: removeEventListener('beforeunload', this.handleUnload);
	},

	componentWillUnmount() {
		removeEventListener('mousemove', this.handleMouseMove);
		removeEventListener('mouseup',   this.handleMouseUp);
		keypress.off('backspace',           AppActions.deleteSelectedItems);
		keypress.off('del',                 AppActions.deleteSelectedItems);
		keypress.off('z', ['ctrl'],         AppActions.undo);
		keypress.off('z', ['ctrl','shift'], AppActions.redo);
		keypress.off('y', ['ctrl'],         AppActions.redo);
		keypress.off('a', ['ctrl'],         AppActions.selectAll);
		keypress.off('esc',                 AppActions.cancel);
		keypress.off('s', ['ctrl'],         AppActions.exportFile);
		keypress.off('o', ['ctrl'],         AppActions.importFile);
	},

	render() {
		console.log('App: render');
		return (
			<div className="m-container" onMouseMove={this.handleMouseMove}>
				<Workbench />
				<Repository />
				<Actions />
			</div>
		);
	}
});
module.exports = App;