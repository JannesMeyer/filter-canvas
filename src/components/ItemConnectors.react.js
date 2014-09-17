var ItemConnectors = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.connectors !== nextProps.connectors;
	},

	handleMouseDown(ev) {
		if (ev.button !== 0) {
			return;
		}
		// TODO: action
		console.log('connection drag');

		ev.stopPropagation();
		ev.preventDefault();
	},

	render() {
		var connectors = this.props.connectors.toArray();
		return (
			<div className={this.props.type}>
				{connectors.map(key =>
					<div className="connector" key={key} onMouseDown={this.handleMouseDown}></div>
				)}
			</div>
		);
	}

});
module.exports = ItemConnectors;