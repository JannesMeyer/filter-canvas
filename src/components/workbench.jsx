var Filter = require('./filter');

var Workbench = React.createClass({
	mixins: [ Fluxxor.FluxMixin(React) ],
	drag: null,
	zCounter: 0,
	componentWillMount() {
		this.filterStore = this.getFlux().store('FilterStore');
	},
	handleMouseDown(filterId, ev) {
		if (ev.button !== 0) {
			return;
		}

		var filter = this.filterStore.filters.get(filterId);
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
		// Set css
		this.drag.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
	},
	handleMouseUp(ev) {
		if (ev.button !== 0 || !this.drag) {
			return;
		}

		var x = this.drag.x + ev.clientX;
		var y = this.drag.y + ev.clientY;
		this.getFlux().actions.dropFilter(this.drag.id, x, y);
		this.drag = null;
	},
	render() {
		var filters = this.filterStore.filters;
		return (
			<div className="m-workbench" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
			{filters.map((filter, key) => {
				return <Filter key={key} onMouseDown={this.handleMouseDown.bind(null, key)} />;
			}).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;