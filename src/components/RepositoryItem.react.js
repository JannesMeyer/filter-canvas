/**
 * A RepositoryItem is part of the filter/pipe repository in the side panel
 * on the right hand side. Each item can be dragged onto the Workbench.
 */
var RepositoryItem = React.createClass({

	/**
	 * HTML5 Drag and Drop:
	 * Collect click position and item type data and send it to
	 * whomever it may concern. In this case the data will be received by
	 * the Workbench as soon as the item has been dropped on it.
	 *
	 * @see Workbench.react.js #handleDrop
	 */
	handleDragStart(ev) {
		var box = ev.currentTarget.getBoundingClientRect();
		var data = {
			id: this.props.id,
			type: this.props.type,
			x: Math.floor(ev.clientX - box.left),
			y: Math.floor(ev.clientY - box.top)
		};
		ev.dataTransfer.setData('Text', JSON.stringify(data));
		ev.dataTransfer.effectAllowed = 'copy';
	},

	/**
	 * Renders the component
	 */
	render() {
		return <div className="item" draggable onDragStart={this.handleDragStart}>{this.props.id}</div>;
	}

});
module.exports = RepositoryItem;