var merge = require('react/lib/merge');

var WorkbenchStore = require('../flux/WorkbenchStore');
var AppActions = require('../flux/AppActions');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');

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
	handleMouseMove(ev) {
		// TODO: check if a drag is happening
		AppActions.draggingOnWorkbench(ev.clientX, ev.clientY);
	},
	handleMouseUp(ev) {
		// TODO: check if a drag is happening
		if (ev.button !== 0) {
			return;
		}
		AppActions.endDragOnWorkbench(ev.clientX, ev.clientY);
	},
	render() {
		console.log('App: render');

		return (
			<div className="m-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
				<Workbench />
				<Repository />
			</div>
		);
	}
});
module.exports = App;