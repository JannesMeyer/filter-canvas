var	DragManager = require('../flux/DragManager');

function getState() {
	return {
		rect: DragManager.getSelectionRect(),
		active: DragManager.isSelecting()
	};
}

var Selection = React.createClass({
	getInitialState: getState,
	_handleChange() {
		this.setState(getState());
	},
	componentDidMount() {
		DragManager.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		DragManager.removeChangeListener(this._handleChange);
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