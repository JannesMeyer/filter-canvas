var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var WConnectors = require('./WConnectors.react');

var WFilter = React.createClass({
	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.frame !== null ||
		       this.props.isSelected !== nextProps.isSelected ||
		       this.props.filter     !== nextProps.filter;
	},
	handleMouseDown(ev) {
		AppActions.startMovingSelectedItems(this.props.key, ev);
	},
	render() {
		var filter = this.props.filter;
		var frame = this.props.frame || filter.get('rect');
		var selected = (this.props.isSelected) ? ' selected' : '';

		var style = {
			left: frame.x,
			top: frame.y,
			width: frame.width,
			height: frame.height
		};
		return (
			<div className={'filter' + selected} style={style} onMouseDown={this.handleMouseDown}>
				<h4>{filter.get('class')}</h4>
				<WConnectors type="inputs" connectors={filter.get('inputs')} />
				<WConnectors type="outputs" connectors={filter.get('outputs')} />
			</div>
		);
	}
});
module.exports = WFilter;