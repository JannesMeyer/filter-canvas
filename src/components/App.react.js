var keypress = require('../lib/keypress-tool');
var Point = require('../lib/ImmutablePoint');
var AppActions = require('../flux/AppActions');
var SelectionStore = require('../stores/SelectionStore');
var CreateConnectionStore = require('../stores/CreateConnectionStore');
var WorkbenchStore = require('../stores/WorkbenchStore');

var Workbench = require('./Workbench.react');
var RepositoryPane = require('./RepositoryPane.react');
var DetailPane = require('./DetailPane.react');
var Actions = require('./Actions.react');

var App = React.createClass({

	handleMouseMove(ev) {
		var x = ev.clientX;
		var y = ev.clientY;

		// Update item positions
		if (WorkbenchStore.isDragging()) {
			var mousePos = new Point(x, y);
			AppActions.moveSelectedItems(mousePos);
		} else

		// Update selection rectangle size
		if (SelectionStore.isSelecting()) {
			var mousePos = new Point(x, y);
			AppActions.resizeSelection(mousePos);
		} else

		// Update temporary wire
		if (CreateConnectionStore.isDragging()) {
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(x, y);
			AppActions.resizeConnection(absMousePos);
		}
	},

	handleMouseUp(ev) {
		if (ev.button !== 0) { return; }

		var x = ev.clientX;
		var y = ev.clientY;

		// Finish selection
		if (WorkbenchStore.isDragging()) {
			var mousePos = new Point(x, y);
			AppActions.finishMovingSelectedItems(mousePos);
		} else

		// Hide selection rectangle
		if (SelectionStore.isSelecting()) {
			AppActions.finishSelection();
		} else

		// Create a connection between an input and an output
		if (CreateConnectionStore.isDragging()) {
			var absMousePos = WorkbenchStore.getScrollOffset().addValues(x, y);
			AppActions.finishConnection(absMousePos);
		}
	},

	confirmPageUnload(ev) {
		var message = 'You have unsaved changes.';
		ev.returnValue = message;
		return message;
	},

	componentDidMount() {
		addEventListener('mousemove', this.handleMouseMove);
		addEventListener('mouseup',   this.handleMouseUp);
		// addEventListener('beforeunload', this.confirmPageUnload);
		keypress.on('backspace',   AppActions.deleteSelectedItems);
		keypress.on('del',         AppActions.deleteSelectedItems);
		keypress.on('a', ['ctrl'], AppActions.selectAll);
		keypress.on('esc',         AppActions.cancel);
	},

	componentWillUnmount() {
		removeEventListener('mousemove', this.handleMouseMove);
		removeEventListener('mouseup',   this.handleMouseUp);
		// removeEventListener('beforeunload', this.confirmPageUnload);
		keypress.off('backspace',   AppActions.deleteSelectedItems);
		keypress.off('del',         AppActions.deleteSelectedItems);
		keypress.off('a', ['ctrl'], AppActions.selectAll);
		keypress.off('esc',         AppActions.cancel);
	},

	render() {
		return (
			<div className="m-app">
				<div className="m-container">
					<Workbench />
					<Actions />
				</div>
				<div className="m-sidebar">
					<RepositoryPane />
					<DetailPane />
				</div>
			</div>
		);
	}
});
module.exports = App;