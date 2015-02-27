var { OrderedMap } = require('immutable');
var AppActions = require('../flux/AppActions');
var SelectionStore = require('../stores/SelectionStore');
var WorkbenchStore = require('../stores/WorkbenchStore');
var EditParameterForm = require('./DetailEditParameterForm.react');
var NewParameterForm = require('./DetailNewParameterForm.react');

var DetailPane = React.createClass({

	getInitialState() {
		return {
			items: WorkbenchStore.getAllItems(),
			selectedItems: SelectionStore.getSelectedItemIds(),
			showNewParameterForm: false,
			newParameter: OrderedMap()
		};
	},
	shouldComponentUpdate(nextProps, nextState) {
		return !this.state.selectedItems.equals(nextState.selectedItems) ||
		       this.state.showNewParameterForm !== nextState.showNewParameterForm ||
		       this.state.newParameter !== nextState.newParameter ||
		       this.state.items !== nextState.items ||
		       localeChange;
	},
	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
		WorkbenchStore.addParamChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
		WorkbenchStore.removeParamChangeListener(this._handleChange);
	},
	showNewParameterForm() {
		this.setState({ showNewParameterForm: true });
	},
	hideNewParameterForm() {
		this.setState({ showNewParameterForm: false });
	},
	handleCreateParameter(key, value) {
		this.setState({
			showNewParameterForm: false,
			newParameter: this.state.newParameter.set(key, value)
		});
	},

	render() {
		var selectedItems = this.state.selectedItems;
		var count = selectedItems.length;

		// No items selected
		if (count === 0) {
			return (
				<div className="m-detail-pane">
					<h3>{translate('detail_pane.headline', { count })}</h3>
				</div>
			);
		}

		// Exactly one item selected
		if (this.state.showNewParameterForm) {
			var itemId = selectedItems.first();
			var item = WorkbenchStore.getItem(itemId);
			return (
				<div className="m-detail-pane">
					<NewParameterForm id={itemId} item={item}
						onCreateParameter={this.handleCreateParameter}
						onCancel={this.hideNewParameterForm} />
				</div>
			);
		}
		if (count === 1) {
			var itemId = selectedItems.first();
			var item = WorkbenchStore.getItem(itemId);
			return (
				<div className="m-detail-pane">
					<EditParameterForm id={itemId} item={item} newParameter={this.state.newParameter}>
						<button type="button" onClick={this.showNewParameterForm}>{translate('detail_pane.new_parameter')}</button>
						<button type="button" onClick={AppActions.deleteSelectedItems} className="red-button">{translate('detail_pane.delete.one')}</button>
					</EditParameterForm>
				</div>
			);
		}

		// 2 or more items selected
		if (count > 1) {
			return (
				<div className="m-detail-pane">
					<h3>{translate('detail_pane.headline', { count })}</h3>
					<button type="button" onClick={AppActions.saveSelectedItemsAsFilter}>{translate('detail_pane.save_complex_filter')}</button>
					<button type="button" onClick={AppActions.deleteSelectedItems} className="red-button">{translate('detail_pane.delete.other')}</button>
				</div>
			);
		}
	},

	_handleChange() {
		this.setState(this.getInitialState());
	}

});
module.exports = DetailPane;