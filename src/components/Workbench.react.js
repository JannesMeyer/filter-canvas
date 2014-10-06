var AppActions = require('../flux/AppActions');
var WorkbenchItems = require('./WorkbenchItems.react');
var CreateSelection = require('./CreateSelection.react');
var CreateConnection = require('./CreateConnection.react');

var Workbench = React.createClass({

	/**
	 * HTML5 Drag and Drop:
	 * Preventing the default signals that elements can be dropped here.
	 */
	handleDragOver(ev) {
		ev.preventDefault();
	},

	/**
	 * HTML5 Drag and Drop:
	 * Called when an element has been dropped.
	 */
	handleDrop(ev) {
		// Get data
		var data = JSON.parse(ev.dataTransfer.getData('application/json'));

		// Create item
		var [scrollX, scrollY] = this.getScrollOffset();
		var filterX = scrollX + ev.clientX - data.clickX;
		var filterY = scrollY + ev.clientY - data.clickY;
		AppActions.createItem(data.type, data.id, filterX, filterY);

		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();
	},

	/**
	 * Called when a drag has been started on the background.
	 * Shows a selection rectangle.
	 */
	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		var [scrollX, scrollY] = this.getScrollOffset();
		AppActions.startSelection(ev.ctrlKey, ev.metaKey, scrollX, scrollY, ev.clientX, ev.clientY);
		ev.preventDefault();
		ev.stopPropagation();
	},

	/**
	 * Returns the scroll position as an array of [x, y]
	 */
	getScrollOffset() {
		var node = this.getDOMNode();
		return [node.scrollLeft, node.scrollTop];
	},

	/**
	 * Renders the Workbench
	 */
	render() {
		return (
			<div className="m-workbench" onDragOver={this.handleDragOver} onDrop={this.handleDrop} onMouseDown={this.handleMouseDown}>
				<WorkbenchItems />
				<CreateSelection />
				<CreateConnection />
			</div>
		);
	}

});
module.exports = Workbench;