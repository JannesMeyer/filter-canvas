var AppActions = require('../flux/AppActions');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');
var Actions = require('./Actions.react');

function confirmPageUnload(ev) {
	var message = 'You are leaving the page with unsaved changes.'
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

	// TODO: catch backspace, del, cmd+a, ctrl+a, ctrl+z, ctrl+shift+z
	// TODO: maybe even copy and paste (cmd+c, cmd+v)
	addEventListener('keydown', ev => {
		var code = ev.keyCode;
		if (code === 8) {
			// backspace
			AppActions.deleteSelectedItems();
			ev.preventDefault();
		} else if (code === 46) {
			// delete
			AppActions.deleteSelectedItems();
			ev.preventDefault();
		}
	});

	// TODO: save architecture in localstorage
	// TODO: check for unsaved changes
	// addEventListener('beforeunload', confirmPageUnload);
	// removeEventListener('beforeunload', confirmPageUnload);
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