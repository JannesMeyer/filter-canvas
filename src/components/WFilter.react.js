var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WConnector = require('./WConnector.react');

var WFilter = React.createClass({
	handleMouseDown(ev) {
		if (ev.button !== 0) {
			return;
		}
		ev.preventDefault();

		AppActions.startDragOnWorkbench(this.props.key, ev.currentTarget, ev.clientX, ev.clientY);
	},
	render() {
		var filter = WorkbenchStore.getFilter(this.props.key);
		var inputs = filter.get('inputs');
		var outputs = filter.get('outputs');

		// var style = {
		// 	transform: 'translate(' + filter.get('x') + 'px,' + filter.get('y') + 'px)'
		// };
		var style = {
			left: filter.get('x') + 'px',
			top: filter.get('y') + 'px',
			height: filter.get('height') + 'px'
		};
		return (
			<div className="m-filter-on-canvas" style={style} tabIndex="0" onMouseDown={this.handleMouseDown}>
				<h4>{filter.get('class')}</h4>

				<div className="inputs">
					{inputs.map((_, key) =>
						<WConnector key={key} type="input" />
					).toArray()}
				</div>

				<div className="outputs">
					{outputs.map((_, key) =>
						<WConnector key={key} type="output" />
					).toArray()}
				</div>
			</div>
		);
	}
});
module.exports = WFilter;