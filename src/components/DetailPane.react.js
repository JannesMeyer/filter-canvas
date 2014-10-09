var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../flux/WorkbenchStore');
var SelectionStore = require('../flux/SelectionStore');
var keypress = require('../lib/keypress-tool');

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
			changedParameter: null,
			newParameterName: null,
			showParameterPopup: false
		};
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.items !== nextState.items ||
		       this.state.showParameterPopup !== nextState.showParameterPopup ||
		      !this.state.selectedItems.equals(nextState.selectedItems) ||
		      (!this.state.changedParameter && nextState.changedParameter);
	},

	componentDidMount() {
		// TODO: what if both of these fire at the same time? (DELETE_SELECTED_ITEMS)
		SelectionStore.addChangeListener(this._handleChange);
		WorkbenchStore.addParamChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		SelectionStore.removeChangeListener(this._handleChange);
		WorkbenchStore.removeParamChangeListener(this._handleChange);
	},

	handleKeyDown(paramName, ev) {
		if (ev.which === 8) {
			var input = ev.target;
			if (input.type === 'checkbox' || input.value === '') {
				// TODO: this totally skips over all changes that haven't been saved yet
				AppActions.removeItemParam(this.state.itemId, paramName);
				ev.preventDefault();
			}
		}
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

		var changedParameter = this.state.changedParameter;
		if (!changedParameter) {
			changedParameter = {};
		}
		changedParameter[field] = value;
		this.setState({ changedParameter });
	},

	handleParamValuesSubmit(itemId, ev) {
		ev.preventDefault();

		if (!this.state.changedParameter) {
			return;
		}
		AppActions.setItemParams(itemId, this.state.changedParameter);
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
		// TODO: show a warning if the parameter name is already taken

		// Update changedParameter
		var changedParameter = this.state.changedParameter || {};
		if (inputType === 'number') {
			changedParameter[name] = 0;
		} else if (inputType === 'checkbox') {
			changedParameter[name] = true;
		} else {
			changedParameter[name] = '';
		}

		form.reset();
		this.setState({
			showParameterPopup: false,
			newParameterName: name,
			changedParameter
		});
	},

	handleCancelClick(ev) {
		document.forms.newParameterDialog.reset();
		this.setState({ showParameterPopup: false });
	},

	componentDidUpdate(prevProps, prevState) {
		var state = this.state;
		// When the parameter popup appears
		if (!prevState.showParameterPopup &&
		    state.showParameterPopup) {
			this.refs.paramName.getDOMNode().focus();
		} else
		// When the popup disappears
		if (!state.showParameterPopup &&
		    prevState.showParameterPopup &&
		    state.newParameterName !== null) {
			this.refs[state.newParameterName].getDOMNode().focus();
		}

		// Manually update those freakin' values whenever the item data changes
		if (state.item && prevState.item) {
			var params = state.item.get('parameter');
			if (params !== prevState.item.get('parameter')) {
				params.forEach((value, id) => {
					var input = this.refs[id].getDOMNode();
					if (input.type === 'checkbox') {
						input.checked = value;
					} else {
						input.value = value;
					}
				});
			}
		}
	},

	render() {
		console.log('Render DetailPane');
		var changedParameter = this.state.changedParameter;
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
			if (showDialog) {
				title = 'Neuer Parameter';
			} else {
				title = this.state.item.get('class');
			}

			var parameter = this.state.item.get('parameter').merge(changedParameter);
			parameter.keySeq().sort().forEach(key => {
					var value = parameter.get(key);
					var onChange = this.handleChange.bind(this, key);
					var input;
					if (typeof value === 'boolean') {
						input = <input type="checkbox" ref={key} defaultChecked={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} />;
					} else if (typeof value === 'number') {
						input = <input type="number" ref={key} defaultValue={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} step="any" />;
					} else {
						input = <input type="text" ref={key} defaultValue={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} />;
					}
					params.push(<label key={this.state.itemId+'-'+key}><span>{key}</span>{input}</label>);
				});
		}

		return (
			<div className="m-detail-pane">
				<h3>{title}</h3>
				<form id="defaultDialog"
					className={!showDialog ?'':'hidden'}
					onSubmit={this.handleParamValuesSubmit.bind(this, this.state.itemId)}
					>
					{params}
					<div className="actions">
						{changedParameter && <button type="submit" accessKey="s">Übernehmen</button>}
						{count === 1      && <button type="button" onClick={this.handleNewParamClick} accessKey="n">Neuer Parameter</button>}
						{count > 1        && <button type="button" onClick={this.handleSaveAsClick}>Als komplexen Filter speichern</button>}
						{count > 0        && <button type="button" onClick={this.handleDeleteClick} className="red-button">Element löschen</button>}
					</div>
				</form>
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
			</div>
		);
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = DetailPane;