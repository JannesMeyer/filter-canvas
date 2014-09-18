var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');

module.exports = React.createClass({

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

		var itemDetails = null;
		var updateItemAction = null;
		if (numItems === 1) {
			var itemId = this.state.selectedItems.first();
			var item = WorkbenchStore.getItem(itemId);
			var params = item.get('parameter');
			var itemClass = item.get('class');
			itemDetails = (
				<div className="details">
					<h3>{itemClass}</h3>
					{params.map((value, key) => {
						if (typeof value === 'number') {
							return <div key={key}><label>{key} <input type="number" defaultValue={value} /></label></div>;
						} else {
							return <div key={key}><label>{key} <input type="text" defaultValue={value} /></label></div>;
						}
					}).toArray()}
				</div>
			);
			if (params.length > 0) {
				updateItemAction = <button>Update parameters</button>;
			}
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
				{itemDetails}
				<div className="actions">
					{updateItemAction}
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