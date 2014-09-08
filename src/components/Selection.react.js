var	SelectionStore = require('../flux/SelectionStore');

function getState() {
	return {
		rect: SelectionStore.getSelectionRect(),
		active: SelectionStore.isSelecting()
	};
}

var Selection = React.createClass({
	getInitialState: getState,
	_handleChange() {
		this.setState(getState());
	},
	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
	},
	render() {
		var rect = this.state.rect;
		var style = {
			left: rect.x + 'px',
			top: rect.y + 'px',
			width: rect.width + 'px',
			height: rect.height + 'px'
		};

		if (!this.state.active) {
			style.opacity = '0';
		}
		return <div className="m-selection" style={style} />;
	}
});
module.exports = Selection;