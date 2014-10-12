// document.forms.newParameterDialog.reset();

// var AppActions = require('../flux/AppActions');
// var WorkbenchStore = require('../stores/WorkbenchStore');
// var SelectionStore = require('../stores/SelectionStore');

// var DetailPane = React.createClass({

// 	getInitialState() {
// 		var items = WorkbenchStore.getAllItems();
// 		var selectedItems = SelectionStore.getSelectedItemIds();
// 		if (selectedItems.length === 1) {
// 			var itemId = selectedItems.first();
// 			var item = WorkbenchStore.getItem(itemId);
// 		}
// 		return {
// 			items, selectedItems, item, itemId,
// 			changed: Set(),
// 			newParameterName: null,
// 			showParameterPopup: false
// 		};
// 	},


// 	handleNewParamSubmit(ev) {
// 		ev.preventDefault();

// 		var form = document.forms.newParameterDialog;
// 		var name = form.paramName.value;
// 		var inputType = form.inputType.value;

// 		if (name.length === 0) {
// 			alert('Bitte geben Sie den Namen des Parameters ein');
// 			this.refs.paramName.getDOMNode().focus();
// 			return;
// 		}
// 		// TODO: show a warning if the parameter name is already taken

// 		// Update changedParameter
// 		var changedParameter = this.state.changedParameter || {};
// 		if (inputType === 'number') {
// 			changedParameter[name] = 0;
// 		} else if (inputType === 'checkbox') {
// 			changedParameter[name] = true;
// 		} else {
// 			changedParameter[name] = '';
// 		}

// 		form.reset();
// 		this.setState({
// 			showParameterPopup: false,
// 			newParameterName: name,
// 			changedParameter
// 		});
// 	},

// 	handleCancelClick(ev) {
// 		document.forms.newParameterDialog.reset();
// 		this.setState({ showParameterPopup: false });
// 	},

// 	componentDidUpdate(prevProps, prevState) {
// 		var state = this.state;
// 		// When the parameter popup appears
// 		if (!prevState.showParameterPopup && state.showParameterPopup) {
// 			this.refs.paramName.getDOMNode().focus();
// 		} else
// 		// When the popup disappears (and the user didn't click cancel)
// 		if (!state.showParameterPopup && prevState.showParameterPopup &&
// 			  state.newParameterName !== null) {
// 			this.refs[state.newParameterName].getDOMNode().focus();
// 		}
// 	},

// 	render() {
// 		var items = this.state.selectedItems;
// 		var changedParameter = this.state.changedParameter;
// 		var showDialog = this.state.showParameterPopup;
// 		var count = items.length;

// 		var title;
// 		var params = [];

// 		// More than one item selected
// 		if (count > 1) {
// 			title = count + ' Elemente markiert';
// 		} else
// 		// No items selected
// 		if (count === 0) {
// 			title = 'Keine Elemente markiert';
// 		} else

// 		// Exactly one item selected. Show its parameters.
// 		if (count === 1) {
// 			var item = this.state.item;
// 			var itemId = this.state.itemId;
// 			if (showDialog) {
// 				title = 'Neuer Parameter';
// 			} else {
// 				title = item.get('class');
// 			}

// 			// Pipe inputs/outputs
// 			var inputs = item.get('inputs');
// 			var outputs = item.get('outputs');
// 			var variableInputs = item.get('variableInputs');
// 			var variableOutputs = item.get('variableOutputs');
// 			var minInputs = item.get('minInputs');
// 			var minOutputs = item.get('minOutputs');

// 			// Forward/Join pipe
// 			if (variableInputs) {
// 				params.push(
// 					<label key="numInputs">
// 						<span>{variableOutputs ? 'lines' : 'inputs'}</span>
// 						<input type="number" ref="numInputs" defaultValue={inputs.length} min={minInputs} onChange={this.handleInputsChange} />
// 					</label>
// 				);
// 			} else
// 			// Split pipe
// 			if (variableOutputs) {
// 				params.push(
// 					<label key="numOutputs">
// 						<span>outputs</span>
// 						<input type="number" ref="numOutputs" defaultValue={outputs.length} min={minOutputs} onChange={this.handleOutputsChange} />
// 					</label>
// 				);
// 			}

// 			// Show all parameters. Select the input element that fits the data type.
// 			var parameter = item.get('parameter').merge(changedParameter);
// 			parameter.keySeq().sort().forEach(key => {
// 					var value = parameter.get(key);
// 					var onChange = this.handleChange.bind(this, key);
// 					var input;
// 					if (typeof value === 'boolean') {
// 						input = <input type="checkbox" ref={key} defaultChecked={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} />;
// 					} else if (typeof value === 'number') {
// 						input = <input type="number" ref={key} defaultValue={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} step="any" />;
// 					} else {
// 						input = <input type="text" ref={key} defaultValue={value} onChange={onChange} onKeyDown={this.handleKeyDown.bind(this, key)} />;
// 					}
// 					params.push(<label key={itemId+'-'+key}><span>{key}</span>{input}</label>);
// 				});
// 		}

// 		var deleteText;
// 		if (count > 1) {
// 			deleteText = 'Elemente löschen';
// 		} else if (count === 1) {
// 			deleteText = 'Element löschen'
// 		}
// 		return (
// 			<div className="m-detail-pane">
// 				<h3>{title}</h3>
// 				<form id="defaultDialog"
// 					className={!showDialog ?'':'hidden'}
// 					onSubmit={this.handleParamValuesSubmit.bind(this, this.state.itemId)}
// 					>
// 					{params}
// 					<div className="actions">
// 						{changedParameter && <button type="submit" accessKey="s">Übernehmen</button>}
// 						{count === 1      && <button type="button" onClick={this.handleNewParamClick} accessKey="n">Neuer Parameter</button>}
// 						{count > 1        && <button type="button" onClick={this.handleSaveAsClick}>Als komplexen Filter speichern</button>}
// 						{count > 0        && <button type="button" onClick={this.handleDeleteClick} className="red-button">{deleteText}</button>}
// 					</div>
// 				</form>
// 				<form id="newParameterDialog" className={showDialog ?'':'hidden'} onSubmit={this.handleNewParamSubmit}>
// 					<input name="paramName" ref="paramName" type="text" placeholder="Parametername" />
// 					<label><input type="radio" name="inputType" value="text" defaultChecked />Text</label>
// 					<label><input type="radio" name="inputType" value="number" />Zahl</label>
// 					<label><input type="radio" name="inputType" value="checkbox" />Boolesche Variable</label>
// 					<div className="actions">
// 						<button type="submit" accessKey="o">OK</button>
// 						<button type="button" accessKey="a" onClick={this.handleCancelClick}>Abbrechen</button>
// 					</div>
// 				</form>
// 			</div>
// 		);
// 	}


var DetailNewParameterForm = React.createClass({
	render() {
		return (
			<div>Neuer Parameter</div>
		);
	}
});
module.exports = DetailNewParameterForm;