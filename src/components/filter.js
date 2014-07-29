/** @jsx React.DOM */

var Filter = React.createClass({
	handleDragStart: function(ev) {
		var data = {
			key: this.props.key,
			clientX: ev.clientX,
			clientY: ev.clientY
		};
		// set opacity of source element to 40%
		ev.target.style.opacity = '0.4';

		ev.dataTransfer.setData('text/plain', JSON.stringify(data));
		ev.dataTransfer.effectAllowed = 'move';
		ev.dataTransfer.dropEffect = 'none';
	},
	handleDragEnd: function(ev) {
		ev.target.style.opacity = '1';
	},
	render: function() {
		var style = {
			left: this.props.x,
			top: this.props.y
		};
		return (
			<div
			  className="filter"
			  draggable="true"
			  onDragStart={this.handleDragStart}
			  onDragEnd={this.handleDragEnd}
			  style={style}>
				<h2>{this.props.header}</h2>
				<div>{this.props.content}</div>
			</div>
		);
	}
});
module.exports = Filter;