var AppActions = require('../flux/AppActions');
var SelectionStore = require('../flux/SelectionStore');
var CreateConnectionStore = require('../flux/CreateConnectionStore');
var WorkbenchStore = require('../flux/WorkbenchStore');
var Point = require('../lib/ImmutablePoint');
var keypress = require('../lib/keypress-tool');

var Workbench = require('./Workbench.react');
var RepositoryPane = require('./RepositoryPane.react');
var DetailPane = require('./DetailPane.react');
var Actions = require('./Actions.react');

var App = React.createClass({

	handleMouseMove(ev) {
		if (WorkbenchStore.isDragging()) {
			var mousePos = new Point(ev.clientX, ev.clientY);
			AppActions.moveSelectedItems(mousePos);
		} else if (SelectionStore.isSelecting()) {
			var mousePos = new Point(ev.clientX, ev.clientY);
			AppActions.resizeSelection(mousePos);
		} else if (CreateConnectionStore.isDragging()) {
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(ev.clientX, ev.clientY);
			AppActions.resizeConnection(absMousePos);
		}
	},

	handleMouseUp(ev) {
		if (ev.button !== 0) { return; }

		if (WorkbenchStore.isDragging()) {
			event.preventDefault();
			event.stopPropagation();

			// Finish selection
			var mousePos = new Point(ev.clientX, ev.clientY);
			AppActions.finishMovingSelectedItems(mousePos);
		} else if (SelectionStore.isSelecting()) {
			ev.preventDefault();
			ev.stopPropagation();

			// Hide selection rectangle
			AppActions.finishSelection();
		} else if (CreateConnectionStore.isDragging()) {
			ev.preventDefault();
			ev.stopPropagation();

			// Create a connection between an input and an output
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(ev.clientX, ev.clientY);
			AppActions.finishConnection(absMousePos);
		}
	},

	confirmPageUnload(ev) {
		var message = 'You have unsaved changes.';
		ev.returnValue = message;
		return message;
	},

	componentDidMount() {
		// Register global event handlers
		addEventListener('mousemove', this.handleMouseMove);
		addEventListener('mouseup',   this.handleMouseUp);
		keypress.on('backspace',   AppActions.deleteSelectedItems);
		keypress.on('del',         AppActions.deleteSelectedItems);
		keypress.on('a', ['ctrl'], AppActions.selectAll);
		keypress.on('esc',         AppActions.cancel);
		// TODO: left, right, up, down

		// TODO: save architecture in localstorage
		// addEventListener('beforeunload', this.confirmPageUnload);
		// TODO: check for unsaved changes
		// TODO: removeEventListener('beforeunload', this.confirmPageUnload);
	},

	componentWillUnmount() {
		removeEventListener('mousemove', this.handleMouseMove);
		removeEventListener('mouseup',   this.handleMouseUp);
		keypress.off('backspace',   AppActions.deleteSelectedItems);
		keypress.off('del',         AppActions.deleteSelectedItems);
		keypress.off('a', ['ctrl'], AppActions.selectAll);
		keypress.off('esc',         AppActions.cancel);
	},

	render() {
		console.log('App: render');
		return (
			<div className="m-container" onMouseMove={this.handleMouseMove}>
				<Workbench />
				<div className="m-sidebar">
					<RepositoryPane />
					<DetailPane />
				</div>
				<Actions />
			</div>
		);
	}
});
module.exports = App;