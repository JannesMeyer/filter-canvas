var AppActions = require('../flux/AppActions');
var Constants = require('../flux/constants');
var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');
var EtherMovementStore = require('../flux/EtherMovementStore');
var WFilterConnectors = require('./WFilterConnectors.react');

// TODO: make dragging/not draggin part of the state and use it to decide
// when to override the position data
function getState() {
	return {
		selected: SelectionStore.isItemSelected('Filter', this.props.key)
	};
}

var WFilter = React.createClass({
	shouldComponentUpdate(nextProps, nextState) {
		return this.state.selected !== nextState.selected ||
		       this.props.filter !== nextProps.filter;
	},
	getInitialState: getState,
	_handleChange() {
		this.setState(getState.call(this));
	},
	componentDidMount() {
		EtherMovementStore.registerItem(this.props.key, this);
		SelectionStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
		EtherMovementStore.unregisterItem(this.props.key);
	},
	handleMouseDown(ev) {
		AppActions.startMovingSelectedItems(Constants.ITEM_TYPE_FILTER, this.props.key, ev);
	},
	render() {
		// console.log('WFilter: render');
		var filter = this.props.filter;
		var rect = filter.get('rect');

		var className = 'm-filter-on-canvas';
		if (this.state.selected) {
			className += ' selected';
		}
		var style = {
			left: rect.x + 'px',
			top: rect.y + 'px',
			width: rect.width + 'px',
			height: rect.height + 'px'
		};
		return (
			<div className={className} style={style} onMouseDown={this.handleMouseDown}>
				<h4>{filter.get('class')}</h4>
				<WFilterConnectors type="inputs" connectors={filter.get('inputs')} />
				<WFilterConnectors type="outputs" connectors={filter.get('outputs')} />
			</div>
		);
	}
});
module.exports = WFilter;