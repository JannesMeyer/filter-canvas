var WorkbenchStore = require('../flux/WorkbenchStore');
var RepositoryStore = require('../flux/RepositoryStore');
var AppActions = require('../flux/AppActions');

var WInput = require('./WInput.react');
var WOutput = require('./WOutput.react');

var WFilter = React.createClass({
	handleMouseDown(ev) {
		if (ev.button !== 0) {
			return;
		}
		ev.preventDefault();

		AppActions.startDragOnWorkbench(this.props.key, ev.currentTarget, ev.clientX, ev.clientY);
	},
	render() {
		var filter = WorkbenchStore.getFilter(this.props.key)
		var filterClassName = filter.get('class');

		var filterClass = RepositoryStore.getFilter(filterClassName);
		var numInputs = filterClass.get('inputs');
		var numOutputs = filterClass.get('outputs');

		var style = { transform: 'translate(' + filter.get('x') + 'px,' + filter.get('y') + 'px)' };
		var inputs = [];
		for (var i = 0; i < numInputs; ++i) {
			inputs.push(<WInput key={i} />);
		}
		var outputs = [];
		for (var i = 0; i < numOutputs; ++i) {
			outputs.push(<WOutput key={i} />);
		}
		return (
			<div className="m-filter-on-canvas" onMouseDown={this.handleMouseDown} style={style}>
				<h4>{filterClassName}</h4>
				{inputs}
				{outputs}
			</div>
		);
	}
});
module.exports = WFilter;