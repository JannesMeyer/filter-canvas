var FilterStore = require('../stores/FilterStore');

var Filter = React.createClass({
	render() {
		var filter = FilterStore.get(this.props.key);
		var inlineStyle = {
			transform: 'translate(' + filter.get('x') + 'px,' + filter.get('y') + 'px)'
		};
		return (
			<div className="filter" style={inlineStyle} onMouseDown={this.props.onMouseDown}>
				<h2>{this.props.key}</h2>
				<div>{filter.get('content')}</div>
			</div>
		);
	}
});
module.exports = Filter;