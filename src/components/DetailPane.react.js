var AppActions = require('../flux/AppActions');
var SelectionStore = require('../stores/SelectionStore');
var EditParameterForm = require('./DetailEditParameterForm.react');
var NewParameterForm = require('./DetailNewParameterForm.react');

var DetailPane = React.createClass({

	getInitialState() {
		return {
			selectedItems: SelectionStore.getSelectedItemIds(),
			showNewParameterForm: false
		};
	},
	shouldComponentUpdate(nextProps, nextState) {
		return !this.state.selectedItems.equals(nextState.selectedItems) ||
		       this.state.showNewParameterForm !== nextState.showNewParameterForm;
	},
	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
	},
	handleNewParameter() {
		this.setState({ showNewParameterForm: true });
	},
	handleNewParameterSubmit(ev) {
		this.setState({ showNewParameterForm: false });
		ev.preventDefault();
	},
	handleNewParameterCancel(ev) {
		this.setState({ showNewParameterForm: false });
	},

	render() {
		var selectedItems = this.state.selectedItems;
		var count = selectedItems.length;

		if (this.state.showNewParameterForm) {
			return (
					<div className="m-detail-pane">
						<NewParameterForm id={selectedItems.first()}
							onSubmit={this.handleNewParameterSubmit}
							onCancel={this.handleNewParameterCancel} />
					</div>
				);
		}

		// No items selected
		if (count === 0) {
			return (
				<div className="m-detail-pane">
					<h3>Keine Elemente markiert</h3>
				</div>
			);
		}

		// Exactly one item selected
		if (count === 1) {
			return (
				<div className="m-detail-pane">
					<EditParameterForm id={selectedItems.first()}>
						<button type="button" onClick={this.handleNewParameter}>Neuer Parameter</button>
						<button type="button" onClick={AppActions.deleteSelectedItems} className="red-button">Element löschen</button>
					</EditParameterForm>
				</div>
			);
		}

		// 2 or more items selected
		if (count > 1) {
			return (
				<div className="m-detail-pane">
					<h3>{count + ' Elemente markiert'}</h3>
					<button type="button" onClick={AppActions.saveSelectedItemsAsFilter}>Als komplexen Filter speichern</button>
					<button type="button" onClick={AppActions.deleteSelectedItems} className="red-button">Elemente löschen</button>
				</div>
			);
		}
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = DetailPane;