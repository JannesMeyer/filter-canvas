/** @jsx React.DOM */

var Filter = React.createClass({
	handleDragStart: function(ev) {
		var data = {
			key: this.props.key,
			clientX: ev.clientX,
			clientY: ev.clientY
		};
		ev.dataTransfer.setData('text/plain', JSON.stringify(data));
		ev.dataTransfer.effectAllowed = 'move';
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