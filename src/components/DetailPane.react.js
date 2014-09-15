var SelectionStore = require('../flux/SelectionStore');
var AppActions = require('../flux/AppActions');

function getState() {
	return {
		selectedItems: SelectionStore.getSelectedItemIds()
	};
}

var DetailPane = React.createClass({
	getInitialState: getState,
	_handleChange() {
		this.replaceState(getState());
	},
	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
	},
	handleDelete(ev) {
		if (ev.button !== 0) {
			return;
		}
		AppActions.deleteSelectedItems();
	},
	render() {
		var numItems = this.state.selectedItems.length;

		var details = null;
		if (numItems === 1) {
			details = <span>TODO</span>;
		}

		var saveAction = null;
		var deleteAction = null;
		if (numItems > 1) {
			saveAction = <button>Save as complex filter</button>;
		}
		if (numItems > 0) {
			deleteAction = <button className="red-button" onClick={this.handleDelete}>Delete</button>;
		}

		var message;
		if (numItems === 0) {
			message = 'No items selected';
		} else if (numItems > 1) {
			message = numItems + ' items selected';
		}

		return (
			<div className="m-detail-pane">
				{message}
				<div className="details">{details}</div>
				<div className="actions">
					{saveAction}
					{deleteAction}
				</div>
			</div>
		);
	}
});
module.exports = DetailPane;