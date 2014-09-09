var WorkbenchStore = require('../flux/WorkbenchStore');
var AppActions = require('../flux/AppActions');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');
var Actions = require('./Actions.react');

// Attach event listeners for global mouse events. It's more accurate
// to do it on the `window` object rather than on a DOM node like React is doing.
if (addEventListener) {
	addEventListener('mousemove', function(ev) {
		AppActions.draggingOnWorkbench(ev.clientX, ev.clientY);
		// TODO: check if a drag is even happening
	});

	addEventListener('mouseup', function(ev) {
		if (ev.button !== 0) { return; }
		AppActions.endDragOnWorkbench(ev.clientX, ev.clientY);
		// TODO: check if a drag is even happening
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