module.exports = React.createClass({

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.connectors !== nextProps.connectors;
	},

	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }

		console.log('TODO: connection drag');

		ev.stopPropagation();
		ev.preventDefault();
	},

	render() {
		var connectors = this.props.connectors;
		var type = this.props.type;
		return (
			<div className={type}>
				{connectors.map(key =>
					<div className="connector" key={key} onMouseDown={this.handleMouseDown}></div>
				).toArray()}
			</div>
		);
	}

});