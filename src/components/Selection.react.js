var	DragManager = require('../flux/DragManager');

var Selection = React.createClass({
	getInitialState() {
		return DragManager.getSelectionBounds();
	},
	_handleChange() {
		this.setState(DragManager.getSelectionBounds());
	},
	componentDidMount() {
		DragManager.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		DragManager.removeChangeListener(this._handleChange);
	},
	render() {
		var state = this.state;
		var style = {};
		style.left = state.left + 'px';
		style.top = state.top + 'px';
		style.width = state.width + 'px';
		style.height = state.height + 'px';
		if (!state.visible) {
			style.opacity = '0';
		}
		return <div className="m-selection" style={style} />;
	}
});
module.exports = Selection;