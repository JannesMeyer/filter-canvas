var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WConnector = require('./WConnector.react');

var itemType = 'ITEM_TYPE_FILTER';

var WFilter = React.createClass({
	filter: null,
	handleMouseDown(ev) {
		AppActions.startMoveSelectedItems(itemType, this.props.key, ev.currentTarget, ev);
	},
	shouldComponentUpdate(nextProps, nextState) {
		return this.filter !== WorkbenchStore.getFilter(nextProps.key);
		// || this.state !== nextState;
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
		// tabIndex="0"
		return (
			<div
				className="m-filter-on-canvas"
				style={style}
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