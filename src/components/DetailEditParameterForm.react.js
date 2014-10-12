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
			changed: Set()
		};
	},
	componentWillReceiveProps(nextProps) {
		this.setState({ changed: Set() });
	},
	componentDidMount() {
		WorkbenchStore.addParamChangeListener(this._handleChange);
	},
	componentWillUnmount() {
		WorkbenchStore.removeParamChangeListener(this._handleChange);
	},
	shouldComponentUpdate(nextProps, nextState) {
		return this.props.id !== nextProps.id ||
		       this.state.changed !== nextState.changed;
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
			return <input
					ref={key}
					type="checkbox"
					defaultChecked={value}
					onChange={onChange}
					onKeyDown={onKeyDown} />;

			case 'number':
			return <input
					ref={key}
					type="number"
					defaultValue={value}
					step="any"
					onChange={onChange}
					onKeyDown={onKeyDown} />;

			default:
			return <input
				ref={key}
				type="text"
				defaultValue={value}
				onChange={onChange}
				onKeyDown={onKeyDown} />;
		}
	},

	render() {
		var item = WorkbenchStore.getItem(this.props.id);
		var changed = this.state.changed;

		if (item.get('variableInputs')) {
			// Forward/Join pipe
			var k = 'inputs';
			var v = item.get('inputs').length;
			var inputs =
				<label className={changed.has(k) ? 'changed' : ''}>
					<span>{k}</span>
					<input type="number"
						ref={k}
						defaultValue={v}
						min={item.get('minInputs')}
						onChange={this.handleChange.bind(this, k)} />
				</label>;
		} else if (item.get('variableOutputs')) {
			// Split pipe
			var k = 'outputs';
			var v = item.get('outputs').length;
			var outputs =
				<label className={changed.has(k) ? 'changed' : ''}>
					<span>{k}</span>
					<input type="number"
						ref={k}
						defaultValue={v}
						min={item.get('minOutputs')}
						onChange={this.handleChange.bind(this, k)} />
				</label>;
		}

		// Show all parameters. Select the input element that fits the data type.
		var params = item.get('parameter')
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
		// When the item has changed or when the form was submitted
		if (prevProps.id !== this.props.id ||
			  prevProps.changed !== this.state.changed && this.state.changed.length === 0) {

			var item = WorkbenchStore.getItem(this.props.id);

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
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = EditParameterForm;