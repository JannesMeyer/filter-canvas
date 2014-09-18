var AppActions = require('../flux/AppActions');
var constants = require('../flux/constants');

var ItemConnectors = require('./ItemConnectors.react');

module.exports = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return nextProps.frame !== null ||
		       this.props.isSelected !== nextProps.isSelected ||
		       this.props.item       !== nextProps.item;
	},

	handleMouseDown(ev) {
		AppActions.startMovingSelectedItems(this.props.key, ev);
	},

	render() {
		var item = this.props.item;
		var frame = this.props.frame || item.get('rect');
		var type = item.get('type');

		var className;
		var title;
		if (type === constants.ITEM_TYPE_FILTER) {
			className = 'filter';
			title = <h4>{item.get('class')}</h4>;
		} else if (type === constants.ITEM_TYPE_PIPE) {
			className = 'pipe';
		} else {
			throw new Error('Invalid item type');
		}
		if (this.props.isSelected) {
			className += ' selected';
		}
		var style = {
			left: frame.x,
			top: frame.y,
			width: frame.width,
			height: frame.height
		};
		return (
			<div className={className} style={style} onMouseDown={this.handleMouseDown}>
				{title}
				<ItemConnectors type="inputs" connectors={item.get('inputs')} />
				<ItemConnectors type="outputs" connectors={item.get('outputs')} />
			</div>
		);
	}

});