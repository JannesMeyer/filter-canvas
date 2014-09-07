var WorkbenchStore = require('../flux/WorkbenchStore');
var AppActions = require('../flux/AppActions');

var Workbench = require('./Workbench.react');
var Repository = require('./Repository.react');

var App = React.createClass({
	getInitialState() {
		return WorkbenchStore.getAllFilters();
	},
	_handleChange() {
		this.setState(this.getInitialState());
	},
	componentDidMount() {
		WorkbenchStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		WorkbenchStore.removeChangeListener(this._handleChange);
	},
	handleMouseMove(ev) {
		AppActions.draggingOnWorkbench(ev.clientX, ev.clientY);
		ev.preventDefault();
	},
	handleMouseUp(ev) {
		if (ev.button !== 0) {
			return;
		}
		AppActions.endDragOnWorkbench(ev.clientX, ev.clientY);
		ev.preventDefault();
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