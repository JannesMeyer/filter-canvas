var AppActions = require('../flux/AppActions');
var WorkbenchItems = require('./WorkbenchItems.react');
var CreateSelection = require('./CreateSelection.react');
var CreateConnection = require('./CreateConnection.react');

module.exports = React.createClass({

	handleDragOver(ev) {
		ev.preventDefault();
	},

	handleDrop(ev) {
		// Get data
		var data = JSON.parse(ev.dataTransfer.getData('application/json'));

		// Create item
		var wb = this.getDOMNode();
		var filterX = wb.scrollLeft + ev.clientX - data.clickX;
		var filterY = wb.scrollTop + ev.clientY - data.clickY;
		AppActions.createItem(data.type, data.id, filterX, filterY);

		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();
	},

	handleMouseDown(ev) {
		var node = this.getDOMNode();
		AppActions.startSelection(node.scrollLeft, node.scrollTop, ev);
	},

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