var RPipe = React.createClass({
	render() {
		return (
			<div className="m-pipe" draggable>{this.props.key}</div>
		);
	}
});
module.exports = RPipe;