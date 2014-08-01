/** @jsx React.DOM */
'use strict';

var Filter = require('./filter');

var Workbench = React.createClass({
	mixins: [ Fluxxor.FluxMixin(React) ],
	drag: {
		id: null,
		element: null,
		startX: null,
		startY: null
	},
	handleMouseMove(ev) {
		if (this.drag.id) {
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
			if (this.drag.id) {
				this.drag.id = null;
			}
		}
	},
	componentWillMount() {
		var flux = this.getFlux();
		this.filterStore = flux.store('FilterStore');
	},
	handleMouseDown(filterId, ev) {
		if (ev.button === 0) {
			var filter = this.filterStore.filter.get(filterId);
			this.drag.id = filterId;
			this.drag.element = this.filterStore.domNodes[filterId];
			this.drag.startX = filter.get('x') - ev.clientX;
			this.drag.startY = filter.get('y') - ev.clientY;
			ev.preventDefault();
		}
	},
	render() {
		return (
			<div className="m-workbench" onMouseMove={this.handleMouseMove} onMouseUp={this.handleMouseUp}>
			{this.filterStore.filter.map((filter, key) => {
				return <Filter key={key} onMouseDown={this.handleMouseDown.bind(null, key)} />;
			}).toArray()}
			</div>
		);
	}
});
module.exports = Workbench;