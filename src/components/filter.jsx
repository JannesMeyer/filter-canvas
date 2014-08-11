var Filter = React.createClass({
	mixins: [ Fluxxor.FluxChildMixin(React) ],
	componentWillMount() {
		this.filterStore = this.getFlux().store('FilterStore');
	},
	render() {
		var filter = this.filterStore.filters.get(this.props.key);
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