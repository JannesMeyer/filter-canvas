var cx = require('react/lib/cx');
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
		var isFilter = (type === constants.ITEM_TYPE_FILTER);
		var isPipe   = (type === constants.ITEM_TYPE_PIPE);

		var classes = cx({
			filter: isFilter,
			pipe: isPipe,
			selected: this.props.isSelected
		});
		var style = {
			left: frame.x,
			top: frame.y,
			width: frame.width,
			height: frame.height
		};
		return (
			<div className={classes} style={style} onMouseDown={this.handleMouseDown}>
				{isFilter && <h4>{item.get('class')}</h4>}
				<ItemConnectors type="inputs" connectors={item.get('inputs')} />
				<ItemConnectors type="outputs" connectors={item.get('outputs')} />
			</div>
		);
	}

});