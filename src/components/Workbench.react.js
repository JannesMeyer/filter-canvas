var Filter = require('./Filter.react');
var FilterStore = require('../stores/FilterStore');
var FilterActions = require('../actions/FilterActions');

function getState() {
	return {
		filters: FilterStore.getAll()
	};
}

var Workbench = React.createClass({
	drag: null,
	zCounter: 0,
	getInitialState: getState,
	componentDidMount() {
		FilterStore.addChangeListener(this._onChange);
	},
	componentWillUnmount() {
		FilterStore.removeChangeListener(this._onChange);
	},
	handleMouseDown(id, ev) {
		if (ev.button !== 0) {
			return;
		}
		var filter = FilterStore.get(id);
		this.drag = {
			id,
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
		// x = Math.round(x / 5 + 1) * 5 - 1;
		// y = Math.round(y / 5 + 1) * 5 - 1;
		// Set transform
		this.drag.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
	},
	handleMouseUp(ev) {
		if (ev.button !== 0 || !this.drag) {
			return;
		}
		var x = this.drag.x + ev.clientX;
		var y = this.drag.y + ev.clientY;
		// Snap to grid
		// x = Math.round(x / 5 + 1) * 5 - 1;
		// y = Math.round(y / 5 + 1) * 5 - 1;
		FilterActions.move(this.drag.id, x, y);
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
	},
	_onChange() {
		this.setState(getState());
	}
});

module.exports = Workbench;