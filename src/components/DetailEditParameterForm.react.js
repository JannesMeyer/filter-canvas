var { Set } = require('immutable');
var AppActions = require('../flux/AppActions');
var WorkbenchStore = require('../stores/WorkbenchStore');

function isEmptyObject(obj) {
	for (var name in obj) {
		return false;
	}
	return true;
}

var EditParameterForm = React.createClass({

	getInitialState() {
		return {
			changed: this.props.newParameter.keySeq().toSet()
		};
	},
	componentWillReceiveProps(nextProps) {
		this.setState({ changed: nextProps.newParameter.keySeq().toSet() });
	},
	shouldComponentUpdate(nextProps, nextState) {
		return this.props.id !== nextProps.id ||
		       this.state.changed !== nextState.changed;
	},

	componentDidMount() {
		// After a new parameter has been created, focus
		var lastKey = this.props.newParameter.keySeq().last();
		if (lastKey) {
			this.refs[lastKey].getDOMNode().focus();
		}
	},

	/**
	 * Potentially deletes a parameter
	 */
	handleKeyDown(paramName, ev) {
		// Backspace
		if (ev.which === 8) {
			var input = ev.target;
			if (input.type === 'checkbox' || input.value === '') {
				// TODO: this totally skips over all changes that haven't been saved yet
				AppActions.removeItemParam(this.state.itemId, paramName);
				ev.preventDefault();
			}
		}
	},

	/**
	 * Called when the value of an input field has changed
	 */
	handleChange(field, ev) {
		if (this.readInputChanged(field)) {
			// Different from the default value
			this.setState({ changed: this.state.changed.add(field) });
		} else {
			// Return to default value
			this.setState({ changed: this.state.changed.remove(field) });
		}
	},

	/**
	 * Click on the submit button. Post parameter values.
	 */
	handleSubmit(ev) {
		ev.preventDefault();

		var params = {};
		this.state.changed.forEach(key => {
			if (key === 'inputs') {
				var numInputs = this.readInputValue(key);
				AppActions.setItemInputs(this.props.id, numInputs);
			} else if (key === 'outputs') {
				var numOutputs = this.readInputValue(key);
				AppActions.setItemOutputs(this.props.id, numOutputs);
			} else {
				params[key] = this.readInputValue(key);
			}
		});

		if (!isEmptyObject(params)) {
			AppActions.setItemParams(this.props.id, params);
		}
	},

	readInputChanged(key) {
		var input = this.refs[key].getDOMNode();
		if (input.type === 'checkbox') {
			return input.checked !== input.defaultChecked;
		} else {
			return input.value !== input.defaultValue;
		}
	},

	readInputValue(key) {
		var input = this.refs[key].getDOMNode();
		switch(input.type) {
			case 'number':
			return input.valueAsNumber;

			case 'checkbox':
			return input.checked;

			default:
			return input.value;
		}
	},

	renderInput(key, value) {
		var onChange = this.handleChange.bind(this, key);
		var onKeyDown = this.handleKeyDown.bind(this, key);
		switch(typeof value) {
			case 'boolean':
			return <input ref={key} type="checkbox" defaultChecked={value} onChange={onChange} onKeyDown={onKeyDown} />;

			case 'number':
			return <input ref={key} type="number" defaultValue={value} step="any" onChange={onChange} onKeyDown={onKeyDown} />;

			default:
			return <input ref={key} type="text" defaultValue={value} onChange={onChange} onKeyDown={onKeyDown} />;
		}
	},

	render() {
		console.log('Render EditParameterForm');
		var item = this.props.item;
		var changed = this.state.changed;

		// Forward/Join pipe
		if (item.get('variableInputs')) {
			var k = 'inputs';
			var v = item.get('inputs').length;
			var min = item.get('minInputs');
			var classes = changed.has(k) ? 'changed' : '';
			var inputs = <label className={classes}><span>{k}</span><input type="number" ref={k} defaultValue={v} min={min} onChange={this.handleChange.bind(this, k)} /></label>;
		} else

		// Split pipe
		if (item.get('variableOutputs')) {
			var k = 'outputs';
			var v = item.get('outputs').length;
			var min = item.get('minOutputs');
			var classes = changed.has(k) ? 'changed' : '';
			var outputs = <label className={classes}><span>{k}</span><input type="number" ref={k} defaultValue={v} min={min} onChange={this.handleChange.bind(this, k)} /></label>;
		}

		// Show all parameters. Select the input element that fits the data type.
		var params = item.get('parameter')
			.merge(this.props.newParameter)
			.sortBy((v, k) => k)
			.map((v, k) =>
				<label key={k} className={changed.has(k) ? 'changed' : ''}>
					<span>{k}</span>
					{this.renderInput(k, v)}
				</label>
			)
			.toArray();

		return (
			<form id="defaultDialog" onSubmit={this.handleSubmit}>
				<h3>{item.get('class')}</h3>
				{inputs}{outputs}{params}
				{changed.length > 0 && <button type="submit">Übernehmen</button>}
				{this.props.children}
			</form>
		);
	},

	/**
	 * Update values manually after selecting a different item
	 */
	componentDidUpdate(prevProps, prevState) {
		console.log('componentDidUpdate');
		// When the item has changed or when the form was submitted, we manually
		// update all the values
		if (prevProps.id !== this.props.id ||
			  prevProps.changed !== this.state.changed && this.state.changed.length === 0) {
			var item = this.props.item;
			// TODO: undo/redo

			// Forward/Join pipe
			if (item.get('variableInputs')) {
				var el = this.refs.inputs.getDOMNode();
				el.defaultValue = el.value = item.get('inputs').length;
			} else

			// Split pipe
			if (item.get('variableOutputs')) {
				var el = this.refs.outputs.getDOMNode();
				el.defaultValue = el.value = item.get('outputs').length;
			}

			// Parameters
			item.get('parameter').forEach((value, key) => {
				var input = this.refs[key].getDOMNode();
				var type = input.type;
				input[type === 'checkbox' ? 'checked' : 'value'] = value;
				input[type === 'checkbox' ? 'defaultChecked' : 'defaultValue'] = value;
			});
		}
	}

});
module.exports = EditParameterForm;