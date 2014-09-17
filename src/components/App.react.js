var AppActions = require('../flux/AppActions');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var keypress = require('../lib/keypress-tool');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');
var Actions = require('./Actions.react');

function confirmPageUnload(ev) {
	var message = 'You have unsaved changes.';
	ev.returnValue = message;
	return message;
}

// Attach event listeners for global mouse events. It's more accurate
// to do it on the `window` object rather than on a DOM node like React is doing.
if (addEventListener) {
	addEventListener('mousemove', ev => {
		if (EtherMovementStore.isDragging()) {
			return AppActions.moveSelectedItems(ev.clientX, ev.clientY);
		}
		if (SelectionStore.isSelecting()) {
			return AppActions.resizeSelection(ev.clientX, ev.clientY);
		}
	});

	addEventListener('mouseup', ev => {
		if (ev.button !== 0) {
			return;
		}
		if (EtherMovementStore.isDragging()) {
			AppActions.finishMovingSelectedItems(ev);
			return;
		}
		if (SelectionStore.isSelecting()) {
			AppActions.finishSelection(ev);
			return;
		}
	});

	// TODO: left, right, up, down
	// Register global keyboard shortcuts
	keypress.on('backspace',           AppActions.deleteSelectedItems);
	keypress.on('del',                 AppActions.deleteSelectedItems);
	keypress.on('z', ['ctrl'],         AppActions.undo);
	keypress.on('z', ['ctrl','shift'], AppActions.redo);
	keypress.on('y', ['ctrl'],         AppActions.redo);
	keypress.on('a', ['ctrl'],         AppActions.selectAll);
	keypress.on('s', ['ctrl'],         AppActions.exportFile);
	keypress.on('o', ['ctrl'],         AppActions.importFile);

	// TODO: save architecture in localstorage
	// addEventListener('beforeunload', confirmPageUnload);
	// TODO: check for unsaved changes
	// TODO: removeEventListener('beforeunload', confirmPageUnload);
}

var App = React.createClass({
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