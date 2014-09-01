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
		if (WorkbenchStore.isNotDragging()) {
			return;
		}
		ev.preventDefault();
		AppActions.draggingOnWorkbench(ev.clientX, ev.clientY);
	},
	handleMouseUp(ev) {
		if (ev.button !== 0 || WorkbenchStore.isNotDragging()) {
			return;
		}
		ev.preventDefault();
		AppActions.endDragOnWorkbench(ev.clientX, ev.clientY);
	},
	render() {
		console.log('rendering');
		return (
			<div className="m-container" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
				<Workbench />
				<Repository />
			</div>
		);
	}
});
module.exports = App;