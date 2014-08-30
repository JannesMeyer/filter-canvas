var WConnector = React.createClass({
	handleMouseDown(ev) {
		if (ev.button !== 0) {
			return;
		}
		ev.stopPropagation();
		ev.preventDefault();

		console.log('connection drag');
	},
	render() {
		return (
			<div className={'connector ' + this.props.type} onMouseDown={this.handleMouseDown}></div>
		);
	}
});
module.exports = WConnector;