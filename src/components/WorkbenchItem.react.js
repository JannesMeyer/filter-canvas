var cx = require('react/lib/cx');
var AppActions = require('../flux/AppActions');
var constants = require('../flux/constants');

module.exports = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.isSelected !== nextProps.isSelected ||
		       this.props.item       !== nextProps.item ||
		       this.props.frame      !== nextProps.frame;
	},

	handleMouseDown(ev) {
		AppActions.startMovingSelectedItems(this.props.key, ev);
	},

	handleConnectorMouseDown(isOutput, id, connectedTo, ev) {
		if (ev.button !== 0) { return; }
		ev.stopPropagation();
		ev.preventDefault();

		if (connectedTo) {
			// TODO: erase the old connection?
			return;
		}

		// [itemId, in/out, connectorId]
		var connector = [this.props.key, isOutput, id];
		AppActions.startConnection(connector, ev.clientX, ev.clientY);
	},

	render() {
		var item = this.props.item;
		var frame = this.props.frame;
		var type = item.get('type');
		var inputs = item.get('inputs').toArray();
		var outputs = item.get('outputs').toArray();
		var isFilter = (type === constants.ITEM_TYPE_FILTER);
		var isPipe = (type === constants.ITEM_TYPE_PIPE);

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

				<div className="inputs">
					{inputs.map((connectedTo, id) =>
						<div key={id} className={cx({ connector: true, unconnected: !connectedTo })} onMouseDown={this.handleConnectorMouseDown.bind(this, 0, id, connectedTo)}></div>
					)}
				</div>

				<div className="outputs">
					{outputs.map((connectedTo, id) =>
						<div key={id} className={cx({ connector: true, unconnected: !connectedTo })} onMouseDown={this.handleConnectorMouseDown.bind(this, 1, id, connectedTo)}></div>
					)}
				</div>
			</div>
		);
	}

});