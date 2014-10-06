var cx = require('react/lib/cx');
var constants = require('../flux/constants');
var AppActions = require('../flux/AppActions');
var Connector = require('./Connector.react');

var WorkbenchItem = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.isSelected !== nextProps.isSelected ||
		       this.props.item       !== nextProps.item ||
		       this.props.frame      !== nextProps.frame;
	},

	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		ev.preventDefault();
		ev.stopPropagation();
		AppActions.startMovingSelectedItems(this.props.key, ev.ctrlKey, ev.metaKey, ev.clientX, ev.clientY);
	},

	handleConnectorMouseDown(isOutput, connectorId, connectedTo, ev) {
		if (ev.button !== 0) { return; }
		ev.stopPropagation();
		ev.preventDefault();

		var connector = [this.props.key, isOutput, connectorId];

		// Erase the old connection
		if (connectedTo) {
			AppActions.deleteConnection(connector, connectedTo);
		}
		// Start dragging a new connection
		AppActions.startConnection(connector, ev.clientX, ev.clientY);
	},

	render() {
		var itemId = this.props.key;
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
						<Connector key={id} address={[itemId, 0, id]} onMouseDown={this.handleConnectorMouseDown.bind(this, 0, id, connectedTo)} />
					)}
				</div>

				<div className="outputs">
					{outputs.map((connectedTo, id) =>
						<Connector key={id} address={[itemId, 1, id]} onMouseDown={this.handleConnectorMouseDown.bind(this, 1, id, connectedTo)} />
					)}
				</div>
			</div>
		);
	}

});
module.exports = WorkbenchItem;