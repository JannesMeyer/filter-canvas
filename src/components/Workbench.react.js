import React from 'react';
import Point from '../lib/ImmutablePoint';
import AppActions from '../flux/AppActions';
import WorkbenchStore from '../stores/WorkbenchStore';
import WorkbenchItems from './WorkbenchItems.react';
import CreateSelection from './CreateSelection.react';
import CreateConnection from './CreateConnection.react';

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
		var data = JSON.parse(ev.dataTransfer.getData('Text'));

		// Create item
		var position = this.getScrollOffset()
			//.addValues(window.pageXOffset, window.pageYOffset)
			.addValues(ev.clientX, ev.clientY)
			.subtractValues(data.x, data.y);
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
	 * Returns the scroll offset as a Point. This function is going to be inserted into the
	 * WorkbenchStore
	 */
	getScrollOffset() {
		var node = this.getDOMNode();
		return new Point(node.scrollLeft, node.scrollTop);
	},

	/**
	 * Enables horizontal scrolling using the mouse wheel
	 *
	 * Causes artifacts in some versions of Chrome after scrolling
	 * Messes with two-finger touchpad scrolling, which is already 2-dimensional
	 */
	handleMouseWheel(ev) {
		this.getDOMNode().scrollLeft += ev.wheelDeltaY - ev.wheelDeltaX;
		ev.preventDefault();
	},

	componentDidMount() {
		// Replace the getScrollOffset function of the WorkbenchStore
		WorkbenchStore.getScrollOffset = this.getScrollOffset;
		// this.getDOMNode().addEventListener('mousewheel', this.handleMouseWheel);
	},

	componentWillUnmount() {
		// Reset the getScrollOffset function
		WorkbenchStore.getScrollOffset = undefined;
		// this.getDOMNode().removeEventListener('mousewheel', this.handleMouseWheel);
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
export default Workbench;