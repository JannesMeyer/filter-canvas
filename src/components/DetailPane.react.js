var immutable = require('immutable');
var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');

var DetailPane = React.createClass({

	getInitialState() {
		var items = WorkbenchStore.getAllItems();
		var selectedItems = SelectionStore.getSelectedItemIds();
		if (selectedItems.length === 1) {
			var itemId = selectedItems.first();
			var item = WorkbenchStore.getItem(itemId);
		}
		return {
			items, selectedItems, item, itemId,
			changedParameter: {},
			newParameterName: null,
			showParameterPopup: false
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.items !== nextState.items ||
		       this.state.showParameterPopup !== nextState.showParameterPopup ||
		      !this.state.selectedItems.equals(nextState.selectedItems);
	},

	handleChange(field, ev) {
		var inputEl = ev.currentTarget;
		var type = inputEl.type;
		var value;
		if (type === 'number') {
			value = inputEl.valueAsNumber;
		} else if (type === 'checkbox') {
			value = inputEl.checked;
		} else {
			value = inputEl.value;
		}

		this.state.changedParameter[field] = value;
		// this.setState(this.state);
	},

	handleParamValuesSubmit(itemId, ev) {
		ev.preventDefault();

		var params = this.state.changedParameter;
		if (Object.keys(params).length === 0) {
			return;
		}

		AppActions.setItemParams(itemId, params);
	},

	handleSaveAsClick(ev) {
		AppActions.saveSelectedItemsAsFilter();
	},

	handleDeleteClick(ev) {
		AppActions.deleteSelectedItems();
	},

	handleNewParamClick(ev) {
		this.setState({ showParameterPopup: true, newParameter: null });
	},

	handleNewParamSubmit(ev) {
		ev.preventDefault();

		var form = document.forms.newParameterDialog;
		var name = form.paramName.value;
		var inputType = form.inputType.value;

		if (name.length === 0) {
			alert('Bitte geben Sie den Namen des Parameters ein');
			this.refs.paramName.getDOMNode().focus();
			return;
		}

		// Reset form
		form.paramName.value = '';

		// Update changedParameter
		var changedParameter = this.state.changedParameter;
		if (inputType === 'number') {
			changedParameter[name] = 0;
		} else if (inputType === 'checkbox') {
			changedParameter[name] = true;
		} else {
			changedParameter[name] = '';
		}

		this.setState({
			showParameterPopup: false,
			newParameterName: name,
			changedParameter
		});
	},

	handleCancelClick(ev) {
		this.setState({ showParameterPopup: false });
	},

	componentDidUpdate(prevProps, prevState) {
		// When the parameter popup appears
		if (!prevState.showParameterPopup && this.state.showParameterPopup) {
			this.refs.paramName.getDOMNode().focus();
		} else
		// When the popup disappears
		if (prevState.showParameterPopup && !this.state.showParameterPopup) {
			this.refs[this.state.newParameterName].getDOMNode().focus();
		}
	},

	componentDidMount() {
		SelectionStore.addChangeListener(this._handleChange);
		WorkbenchStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
		WorkbenchStore.removeChangeListener(this._handleChange);
	},

	render() {
		var showDialog = this.state.showParameterPopup;
		var items = this.state.selectedItems;
		var count = items.length;

		var title;
		var params = [];

		if (count > 1) {
			title = count + ' Objekte markiert';
		} else if (count === 0) {
			title = 'Keine Objekte markiert';
		} else if (count === 1) {
			var item = this.state.item;
			var itemId = this.state.itemId;
			var changedParameter = this.state.changedParameter;

			title = item.get('class');
			params = item.get('parameter')
				.merge(changedParameter)
				.map((value, paramId) => {
					var onChange = this.handleChange.bind(this, paramId);
					var input;
					if (typeof value === 'boolean') {
						input = <input type="checkbox" ref={paramId} defaultChecked={value} onChange={onChange} />;
					} else if (typeof value === 'number') {
						input = <input type="number" ref={paramId} defaultValue={value} onChange={onChange} step="any" />;
					} else {
						input = <input type="text" ref={paramId} defaultValue={value} onChange={onChange} />;
					}
					return <label key={itemId+'-'+paramId}><span>{paramId}</span>{input}</label>;
				})
				.toArray();
		}
		if (showDialog) {
			title = 'Neuer Parameter';
		}

		return (
			<div className="m-detail-pane">

				<h3>{title}</h3>

				<form id="newParameterDialog" className={showDialog ?'':'hidden'} onSubmit={this.handleNewParamSubmit}>
					<input name="paramName" ref="paramName" type="text" placeholder="Parametername" />
					<label><input type="radio" name="inputType" value="text" defaultChecked />Text</label>
					<label><input type="radio" name="inputType" value="number" />Zahl</label>
					<label><input type="radio" name="inputType" value="checkbox" />Boolesche Variable</label>
					<div className="actions">
						<button type="submit" accessKey="o">OK</button>
						<button type="button" accessKey="a" onClick={this.handleCancelClick}>Abbrechen</button>
					</div>
				</form>

				<form id="defaultDialog" className={!showDialog ?'':'hidden'} onSubmit={this.handleParamValuesSubmit.bind(this, this.state.itemId)}>
					{params}
					<div className="actions">
						{params.length > 0 && <button type="submit" accessKey="s">Parameter übernehmen</button>}
						{count === 1       && <button type="button" onClick={this.handleNewParamClick} accessKey="n">Neuer Parameter</button>}
						{count > 1         && <button type="button" onClick={this.handleSaveAsClick}>Als komplexen Filter speichern</button>}
						{count > 0         && <button type="button" onClick={this.handleDeleteClick} className="red-button">Element löschen</button>}
					</div>
				</form>

			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = DetailPane;