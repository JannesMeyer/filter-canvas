/** @jsx React.DOM */
var Filter = require('./filter');

var Main = React.createClass({
	getInitialState: function() {
		return {
			filters: {
				'Header 1': { content: 'Content 1', x: 20, y: 24 },
				'Header 2': { content: 'Content 2', x: 20, y: 24 + 1 * 80 },
				'Header 3': { content: 'Content 3', x: 20, y: 24 + 2 * 80 },
				'Header 4': { content: 'Content 4', x: 20, y: 24 + 3 * 80 },
				'Header 5': { content: 'Content 5', x: 20, y: 24 + 4 * 80 }
			}
		}
	},
	handleDragOver: function(ev) {
		ev.preventDefault();
	},
	handleDrop: function(ev) {
		ev.stopPropagation(); // Stops some browsers from redirecting
		ev.preventDefault();

		// Get data (could throw)
		var data = JSON.parse(ev.dataTransfer.getData('application/json'));

		// Update state
		var nextState = this.state;
		var filter = nextState.filters[data.key];
		filter.x += ev.clientX - data.clientX;
		filter.y += ev.clientY - data.clientY;
		nextState.filters[data.key] = filter;
		this.setState(nextState);
	},
	render: function() {
		return (
			<div className="m-workbench" onDragOver={this.handleDragOver} onDrop={this.handleDrop}>
				{Object.keys(this.state.filters).map(key => {
					var state = this.state.filters[key];
					return <Filter key={key} header={key} content={state.content} x={state.x} y={state.y} />;
				})}
			</div>
		);
	}
});
module.exports = Main;