var merge = require('react/lib/merge');

var WorkbenchStore = require('../flux/WorkbenchStore');
var AppActions = require('../flux/AppActions');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');

// Attach event listeners for global mouse events. It's more accurate
// to do it on the `window` object rather than on a DOM node like React is doing.
addEventListener('mousemove', function(ev) {
	// TODO: check if a drag is even happening
	AppActions.draggingOnWorkbench(ev.clientX, ev.clientY);
});

addEventListener('mouseup', function(ev) {
	if (ev.button !== 0) {
		return;
	}
	// TODO: check if a drag is even happening
	AppActions.endDragOnWorkbench(ev.clientX, ev.clientY);
});

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
			</div>
		);
	}
});
module.exports = App;