module.exports = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.connectors !== nextProps.connectors;
	},

	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		ev.stopPropagation();
		ev.preventDefault();

		console.log('TODO: connection drag');
	},

	render() {
		var connectors = this.props.connectors;
		return (
			<div className={this.props.type}>
				{connectors.map((_, index) =>
					<div className="connector" key={index} onMouseDown={this.handleMouseDown}></div>
				).toArray()}
			</div>
		);
	}

});