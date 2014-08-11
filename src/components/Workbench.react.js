var Filter = require('./Filter.react');
var FilterStore = require('../stores/FilterStore');
var AppActions = require('../actions');

function getFilterState() {
	return {
		// allTodos: TodoStore.getAll(),
		// areAllComplete: TodoStore.areAllComplete()
	};
}

var Workbench = React.createClass({
	drag: null,
	zCounter: 0,

	getInitialState: getFilterState,

	_onChange: function() {
		this.setState(getFilterState());
	},

	componentDidMount: function() {
		FilterStore.addChangeListener(this._onChange);
	},

	componentWillUnmount: function() {
		FilterStore.removeChangeListener(this._onChange);
	},

	handleMouseDown(filterId, ev) {
		if (ev.button !== 0) {
			return;
		}
		var filter = FilterStore.get(filterId);
		this.drag = {
			id: filterId,
			element: ev.currentTarget,
			x: filter.get('x') - ev.clientX,
			y: filter.get('y') - ev.clientY
		};
		this.drag.element.style.zIndex = ++this.zCounter;
		ev.preventDefault();
	},
	handleMouseMove(ev) {
		if (!this.drag) {
			return;
		}
		var x = this.drag.x + ev.clientX;
		var y = this.drag.y + ev.clientY;
		// Snap to grid
		x = Math.round(x / 5 + 1) * 5 - 1;
		y = Math.round(y / 5 + 1) * 5 - 1;
		// Set transform
		this.drag.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
	},
	handleMouseUp(ev) {
		if (ev.button !== 0 || !this.drag) {
			return;
		}
		var x = this.drag.x + ev.clientX;
		var y = this.drag.y + ev.clientY;
		AppActions.move(this.drag.id, x, y);
		this.drag = null;
	},
	render() {
		return (
			<div className="m-workbench" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
			{FilterStore.getAll().map((filter, key) => {
				return <Filter key={key} onMouseDown={this.handleMouseDown.bind(null, key)} />;
			}).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;