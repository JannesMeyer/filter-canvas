var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var Point = require('../lib/ImmutablePoint');

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
		var position = this.getScrollOffset()
			.addValues(ev.clientX, ev.clientY)
			.subtractValues(data.clickX, data.clickY);
		AppActions.createItem(data.type, data.id, position);

		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();
	},

	/**
	 * Called when a drag has been started on the background.
	 * Shows a selection rectangle.
	 */
	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		var scrollOffset = this.getScrollOffset();
		var position = scrollOffset.addValues(ev.clientX, ev.clientY);
		AppActions.startSelection(ev.ctrlKey, ev.metaKey, scrollOffset, position);
		ev.preventDefault();
		ev.stopPropagation();
	},

	/**
	 * Returns the scroll offset as a Point
	 */
	getScrollOffset() {
		var node = this.getDOMNode();
		return new Point(node.scrollLeft, node.scrollTop);
	},

	/**
	 * Enables horizontal scrolling with the mouse wheel
	 */
	handleMouseWheel(ev) {
		// TODO: don't mess with touchpad scrolling
		// TODO: invert scrolling instead of redirecting the vertical scrolling
		this.getDOMNode().scrollLeft += ev.wheelDeltaY - ev.wheelDeltaX;
		ev.preventDefault();
	},

	componentDidMount() {
		this.getDOMNode().addEventListener('mousewheel', this.handleMouseWheel);
		WorkbenchStore.getScrollOffset = this.getScrollOffset;
	},

	componentWillUnmount() {
		this.getDOMNode().removeEventListener('mousewheel', this.handleMouseWheel);
		WorkbenchStore.getScrollOffset = undefined;
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