var	SelectionStore = require('../flux/SelectionStore');

var Selection = React.createClass({
	getInitialState() {
		return {
			rect: SelectionStore.getSelectionRect(),
			active: SelectionStore.isSelecting()
		};
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
			left: rect.x,
			top: rect.y,
			width: rect.width,
			height: rect.height,
			opacity: this.state.active ? 1 : 0
		};
		return <div className="m-selection" style={style} />;
	},
	_handleChange() {
		this.replaceState(this.getInitialState());
	}
});
module.exports = Selection;