var SelectionStore = require('../flux/SelectionStore');
var AppActions = require('../flux/AppActions');

var DetailPane = React.createClass({

	getInitialState() {
		return {
			selectedItems: SelectionStore.getSelectedItemIds()
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return !this.state.selectedItems.equals(nextState.selectedItems);
	},

	handleDeleteClick(ev) {
		if (ev.button !== 0) { return; }
		AppActions.deleteSelectedItems();
	},

	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
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
			deleteAction = <button className="red-button" onClick={this.handleDeleteClick}>Delete</button>;
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
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = DetailPane;