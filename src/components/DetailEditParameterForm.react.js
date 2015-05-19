import React from 'react';
import translate from 'counterpart';
import { Set } from 'immutable';
import AppActions from '../flux/AppActions';

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
		this.setState({ changed: Set() });
	},

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.item !== nextProps.item ||
		       this.state.changed !== nextState.changed ||
		       window.localeChange;
	},

	componentDidMount() {
		// After a new parameter has been created, focus its input
		var lastKey = this.props.newParameter.keySeq().last();
		if (lastKey) {
			this.refs[lastKey].getDOMNode().focus();
		}
	},

	/**
	 * Potentially deletes a parameter
	 */
	handleKeyDown(key, ev) {
		if (ev.which === 8) { // Backspace
			var inputEl = ev.currentTarget;
			if (inputEl.type === 'checkbox' || inputEl.value === '') {
				// TODO: This erases all changes that haven't been saved yet
				AppActions.removeItemParam(this.props.id, key);
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
		var allParams = this.props.item.get('parameter').merge(this.props.newParameter);
		this.state.changed.forEach(key => {
			var type = typeof allParams.get(key);
			if (key === 'inputs') {
				AppActions.setItemInputs(this.props.id, this.readNumberValue(key));
			} else if (key === 'outputs') {
				AppActions.setItemOutputs(this.props.id, this.readNumberValue(key));
			} else if (type === 'number') {
				params[key] = this.readNumberValue(key);
			} else if (type === 'boolean') {
				params[key] = this.readBooleanValue(key);
			} else {
				params[key] = this.readTextValue(key);
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

	readNumberValue(key) {
		var input = this.refs[key].getDOMNode();
		// input.valueAsNumber is so buggy in Internet Explorer that we can't use it
		return parseFloat(input.value);
	},

	readBooleanValue(key) {
		return this.refs[key].getDOMNode().checked;
	},

	readTextValue(key) {
		return this.refs[key].getDOMNode().value;
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
			.sortBy((v, k) => k.toLowerCase())
			.map((v, k) =>
				<label key={k} className={changed.has(k) ? 'changed' : ''}>
					<span>{k}</span>
					{this.renderInput(k, v)}
				</label>
			)
			.toArray();

		return (
			<form className="dialog-default" onSubmit={this.handleSubmit}>
				<h3>{item.get('class')}</h3>
				{inputs}{outputs}{params}
				{changed.length > 0 && <button type="submit">{translate('dialog.apply')}</button>}
				{this.props.children}
			</form>
		);
	},

	/**
	 * Update values manually after selecting a different item
	 */
	componentDidUpdate(prevProps, prevState) {
		// When the item has changed, when the form was submitted or when the user did an
		// undo/redo
		if (prevProps.item !== this.props.item) {
			// Manually update all the values
			var item = this.props.item;

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
export default EditParameterForm;