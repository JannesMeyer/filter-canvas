var AppActions = require('../flux/AppActions');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var keypress = require('../lib/keypress-tool');

var Workbench = require('./Workbench.react');
var RepositoryPane = require('./RepositoryPane.react');
var DetailPane = require('./DetailPane.react');
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