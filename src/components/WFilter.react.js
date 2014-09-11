var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');
var WConnector = require('./WConnector.react');

function getState() {
	return {
		selected: SelectionStore.isItemSelected('Filter', this.props.key)
	};
}

var WFilter = React.createClass({
	filter: null,
	shouldComponentUpdate(nextProps, nextState) {
		return this.filter !== WorkbenchStore.getFilter(nextProps.key) ||
		       this.state.selected !== nextState.selected;
	},
	getInitialState: getState,
	_handleChange() {
		this.setState(getState.call(this));
	},
	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
	},
	handleMouseDown(ev) {
		AppActions.startMoveSelectedItems(itemType, this.props.key, ev.currentTarget, ev);
	},
	render() {
		var filter = this.filter = WorkbenchStore.getFilter(this.props.key);
		var rect = filter.get('rect');
		var inputs = filter.get('inputs');
		var outputs = filter.get('outputs');
		var selected = this.state.selected;

		var className = 'm-filter-on-canvas' + (selected ? ' selected' : '');
		var style = {
			left: rect.x + 'px',
			top: rect.y + 'px',
			width: rect.width + 'px',
			height: rect.height + 'px'
		};
		return (
			<div className={className} style={style} onMouseDown={this.handleMouseDown}>
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