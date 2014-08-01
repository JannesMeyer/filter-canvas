/** @jsx React.DOM */
'use strict';

var Filter = React.createClass({
	mixins: [ Fluxxor.FluxChildMixin(React) ],
	componentWillMount() {
		var flux = this.getFlux();
		this.actions = flux.actions;
		this.filter = flux.store('FilterStore').filter.get(this.props.key);
	},
	componentDidMount() {
		this.actions.filterDidMount(this.props.key, this.getDOMNode());
	},
	render() {


		var header = this.props.key;
		var content = this.filter.get('content');
		var x = this.filter.get('x');
		var y = this.filter.get('y');
		var inlineStyle = {
			transform: 'translate(' + x + 'px,' + y + 'px)'
		};

		return (
			<div className="filter" style={inlineStyle} onMouseDown={this.props.onMouseDown}>
				<h2>{header}</h2>
				<div>{content}</div>
			</div>
		);
	}
});
module.exports = Filter;