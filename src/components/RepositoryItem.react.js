var RepositoryItem = React.createClass({

	/**
	 * HTML5 Drag and Drop:
	 * Collect click position and item type data and send it to
	 * whomever it may concern
	 */
	handleDragStart(ev) {
		var box = ev.currentTarget.getBoundingClientRect();
		var data = {
			id: this.props.key,
			type: this.props.type,
			x: Math.floor(ev.clientX - box.left),
			y: Math.floor(ev.clientY - box.top)
		};
		ev.dataTransfer.setData('Text', JSON.stringify(data));
		ev.dataTransfer.effectAllowed = 'copy';
	},

	render() {
		return <div className="item" draggable onDragStart={this.handleDragStart}>{this.props.key}</div>;
	}

});
module.exports = RepositoryItem;