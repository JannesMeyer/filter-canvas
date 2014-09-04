var AppActions = require('../flux/AppActions');
var RepositoryStore = require('../flux/RepositoryStore');

var RFilter = React.createClass({
	handleMouseDown(ev) {
		if (ev.button !== 0) { return; }
		AppActions.startDragFromRepo(this.props.key, ev.currentTarget, ev.clientX, ev.clientY);
		ev.preventDefault();
	},
	render() {
		var filter = RepositoryStore.getFilter(this.props.key);
		return (
			<div className="m-filter" onMouseDown={this.handleMouseDown}>{this.props.key}</div>
		);
	}
});
module.exports = RFilter;