var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WConnector = require('./WConnector.react');

var WFilter = React.createClass({
	filter: null,
	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		AppActions.startDragOnWorkbench(this.props.key, ev.currentTarget, ev.clientX, ev.clientY);
		ev.preventDefault();
		ev.stopPropagation();
	},
	shouldComponentUpdate(nextProps, nextState) {
		return this.filter !== WorkbenchStore.getFilter(nextProps.key);
	},
	render() {
		var filter = this.filter = WorkbenchStore.getFilter(this.props.key);
		var rect = filter.get('rect');
		var inputs = filter.get('inputs');
		var outputs = filter.get('outputs');

		var style = {
			left: rect.x + 'px',
			top: rect.y + 'px',
			width: rect.width + 'px',
			height: rect.height + 'px'
		};
		return (
			<div
				className="m-filter-on-canvas"
				style={style}
				tabIndex="0"
				onMouseDown={this.handleMouseDown}
				>

				<h4>{filter.get('class')}</h4>

				<div className="inputs">
					{inputs.map(key =>
						<WConnector key={key} type="input" />
					).toArray()}
				</div>

				<div className="outputs">
					{outputs.map(key =>
						<WConnector key={key} type="output" />
					).toArray()}
				</div>
			</div>
		);
	}
});
module.exports = WFilter;