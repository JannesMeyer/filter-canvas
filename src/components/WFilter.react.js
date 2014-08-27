var RepositoryStore = require('../flux/RepositoryStore');

var WFilter = React.createClass({
	render() {
		var filterClass = RepositoryStore.getFilter(this.props.filterClass);
		console.log(filterClass);
		var style = {
			transform: 'translate(' + this.props.x + 'px,' + this.props.y + 'px)'
		};
		return (
			<div className="m-filter-on-canvas" style={style} onMouseDown={this.props.onMouseDown}>
				<h4>{this.props.filterClass}</h4>
				<div>inputs: {filterClass.get('inputs')}</div>
				<div>outputs: {filterClass.get('outputs')}</div>
			</div>
		);
	}
});
module.exports = WFilter;