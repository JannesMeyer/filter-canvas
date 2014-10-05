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

	handleUpdateClick(ev) {
		if (ev.button !== 0) { return; }
		console.log('TODO: update parameters');
	},

	handleSaveAsClick(ev) {
		if (ev.button !== 0) { return; }
		AppActions.saveSelectedItemsAsFilter();
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
		var items = this.state.selectedItems;
		var count = items.length;

		var message;
		if (count === 0) { message = 'No items selected'; }
		if (count > 1)   { message = count + ' items selected'; }

		var itemClass, itemParams = [];
		if (count === 1) {
			var itemId = items.first();
			var item = WorkbenchStore.getItem(itemId);

			itemClass = item.get('class');
			itemParams = item.get('parameter').map((value, key) => {
				var type = (typeof value === 'number') ? 'number' : 'text';
				return <label key={itemId + ',' + key}>{key}<input type={type} defaultValue={value} /></label>;
			}).toArray();
		}

		return (
			<div className="m-detail-pane">
				{message}
				<div className="details">
					<h3>{itemClass}</h3>
					{itemParams}
				</div>
				<div className="actions">
					{itemParams.length > 0 && <button onClick={this.handleUpdateClick}>Update parameters</button>}
					{items.length > 1      && <button onClick={this.handleSaveAsClick}>Save as complex filter</button>}
					{items.length > 0      && <button onClick={this.handleDeleteClick} className="red-button">Delete</button>}
				</div>
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});