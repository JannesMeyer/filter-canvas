var Filter = require('./Filter.react');
var FilterStore = require('../flux/FilterStore');
var FilterActions = require('../flux/FilterActions');

var TemporaryHolder = React.createClass({
	render() {
		return (
			<Filter key='dragging' />
		);
	}
});
module.exports = TemporaryHolder;