var WFilter = require('./WFilter.react');
var FilterStore = require('../flux/FilterStore');
var FilterActions = require('../flux/FilterActions');

function getState() {
	return FilterStore.getAll();
}

var drag = null;
var zCounter = 0;

function getDragPosition(mouseX, mouseY) {
	var x = drag.mouseX + mouseX;
	var y = drag.mouseY + mouseY;
	// Snap to grid:
	// x = Math.round(x / 5 + 1) * 5 - 1;
	// y = Math.round(y / 5 + 1) * 5 - 1;
	return {x, y};
}

var Workbench = React.createClass({
	getInitialState: getState,

	handleChange() {
		this.setState(getState());
	},

	handleMouseDown(id, ev) {
		if (ev.button !== 0) { return; }

		var filter = FilterStore.get(id);
		drag = {
			id,
			element: ev.currentTarget,
			mouseX: filter.get('x') - ev.clientX,
			mouseY: filter.get('y') - ev.clientY
		};
		drag.element.style.zIndex = ++zCounter;
		ev.preventDefault();
	},

	handleMouseMove(ev) {
		if (!drag) { return; }

		var {x, y} = getDragPosition(ev.clientX, ev.clientY);
		drag.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
	},

	handleMouseUp(ev) {
		if (!drag || ev.button !== 0) { return; }

		var {x, y} = getDragPosition(ev.clientX, ev.clientY);
		FilterActions.move(drag.id, x, y);
		drag = null;
	},

	componentDidMount() {
		FilterStore.addChangeListener(this.handleChange);
	},

	componentWillUnmount() {
		FilterStore.removeChangeListener(this.handleChange);
	},

	render() {
		return (
			<div className="m-workbench" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
			{FilterStore.getAll().map((filter, key) => {
				return <WFilter
					key={key}
					x={filter.get('x')}
					y={filter.get('y')}
					filterClass={filter.get('class')}
					onMouseDown={this.handleMouseDown.bind(null, key)} />;
			}).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;