var RFilter = React.createClass({
	handleDragStart(ev) {
		var bounds = ev.currentTarget.getBoundingClientRect();
		var data = {
			id: this.props.key,
			clickX: Math.floor(ev.clientX - bounds.left),
			clickY: Math.floor(ev.clientY - bounds.top),
			width: Math.floor(bounds.width),
			height: Math.floor(bounds.height)
		};
		ev.dataTransfer.setData('application/json', JSON.stringify(data));
		ev.dataTransfer.effectAllowed = 'copy';
	},
	render() {
		return <div className="m-filter" draggable onDragStart={this.handleDragStart}>{this.props.key}</div>;
	}
});
module.exports = RFilter;