/** @jsx React.DOM */
'use strict';

var Filter = require('./filter');

var Workbench = React.createClass({
	mixins: [ Fluxxor.FluxMixin(React) ],
	drag: null,
	componentWillMount() {
		this.filterStore = this.getFlux().store('FilterStore');
	},
	handleMouseDown(filterId, ev) {
		if (ev.button === 0) {
			var filter = this.filterStore.filters.get(filterId);
			this.drag = {
				id: filterId,
				element: ev.currentTarget,
				startX: filter.get('x') - ev.clientX,
				startY: filter.get('y') - ev.clientY
			};
			// TODO: new action that makes the z-index part of the state
			// maybe that's not necessary, if overlapping isn't allowed for dropped elements
			this.drag.element.style.zIndex = 9999;
			ev.preventDefault();
		}
	},
	handleMouseMove(ev) {
		if (this.drag) {
			var x = this.drag.startX + ev.clientX;
			var y = this.drag.startY + ev.clientY;
			this.drag.element.style.transform = 'translate(' + x + 'px,' + y + 'px)';
		}
	},
	handleMouseUp(ev) {
		if (ev.button === 0) {
			var x = this.drag.startX + ev.clientX;
			var y = this.drag.startY + ev.clientY;
			this.getFlux().actions.dropFilter(this.drag.id, x, y);
			this.drag.element.style.zIndex = 'auto';
			this.drag = null;
		}
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