var AppActions = require('../flux/AppActions');
var Constants = require('../flux/constants');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WFilterConnectors = require('./WFilterConnectors.react');

var WFilter = React.createClass({
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.frame !== null ||
		       this.props.isSelected !== nextProps.isSelected ||
		       this.props.filter     !== nextProps.filter;
	},
	handleMouseDown(ev) {
		AppActions.startMovingSelectedItems(Constants.ITEM_TYPE_FILTER, this.props.key, ev);
	},
	render() {
		var filter = this.props.filter;
		var frame = this.props.frame || filter.get('rect');
		var selected = (this.props.isSelected) ? ' selected' : '';

		var style = {
			left: frame.x + 'px',
			top: frame.y + 'px',
			width: frame.width + 'px',
			height: frame.height + 'px'
		};
		return (
			<div className={'m-filter-on-canvas' + selected} style={style} onMouseDown={this.handleMouseDown}>
				<h4>{filter.get('class')}</h4>
				<WFilterConnectors type="inputs" connectors={filter.get('inputs')} />
				<WFilterConnectors type="outputs" connectors={filter.get('outputs')} />
			</div>
		);
	}
});
module.exports = WFilter;