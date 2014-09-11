var WConnector = require('./WConnector.react');

var WFilterConnectors = React.createClass({
	shouldComponentUpdate(nextProps, nextState) {
		return this.props.connectors !== nextProps.connectors;
	},
	render() {
		var connectorType = (this.props.type === 'inputs') ? 'input' : 'output';
		return (
			<div className={this.props.type}>
				{this.props.connectors.map(key =>
					<WConnector key={key} type={connectorType} />
				).toArray()}
			</div>
		);
	}
});
module.exports = WFilterConnectors;