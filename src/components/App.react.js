var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var AppActions = require('../flux/AppActions');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');
var Actions = require('./Actions.react');

// Attach event listeners for global mouse events. It's more accurate
// to do it on the `window` object rather than on a DOM node like React is doing.
if (addEventListener) {
	addEventListener('mousemove', function(ev) {
		if (EtherMovementStore.isDragging()) {
			return AppActions.moveSelectedItems(ev.clientX, ev.clientY);
		}
		if (SelectionStore.isSelecting()) {
			return AppActions.resizeSelection(ev.clientX, ev.clientY);
		}
	});

	addEventListener('mouseup', function(ev) {
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
}

var App = React.createClass({
	getInitialState() {
		return WorkbenchStore.getAllFilters();
	},
	_handleChange() {
		this.replaceState(WorkbenchStore.getAllFilters());
	},
	componentDidMount() {
		WorkbenchStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		WorkbenchStore.removeChangeListener(this._handleChange);
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