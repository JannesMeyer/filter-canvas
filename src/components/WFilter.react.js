var WInput = require('./WInput.react');
var WOutput = require('./WOutput.react');
var RepositoryStore = require('../flux/RepositoryStore');

var WFilter = React.createClass({
	render() {
		var filterClass = RepositoryStore.getFilter(this.props.filterClass);
		var numInputs = filterClass.get('inputs');
		var numOutputs = filterClass.get('outputs');
		var inputComponents = [];
		var outputComponents = [];
		for (var i = 0; i < numInputs; ++i) {
			inputComponents.push(<WInput key={i} />);
		}
		for (var i = 0; i < numOutputs; ++i) {
			outputComponents.push(<WOutput key={i} />);
		}

		var style = {
			transform: 'translate(' + this.props.x + 'px,' + this.props.y + 'px)'
		};
		return (
			<div className="m-filter-on-canvas" style={style} onMouseDown={this.props.onMouseDown}>
				<h4>{this.props.filterClass}</h4>
				{inputComponents}
				{outputComponents}
			</div>
		);
	}
});
module.exports = WFilter;