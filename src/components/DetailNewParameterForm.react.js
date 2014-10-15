var AppActions = require('../flux/AppActions');

var DetailNewParameterForm = React.createClass({

	componentDidMount() {
		this.refs.key.getDOMNode().focus();
	},

	handleSubmit(ev) {
		ev.preventDefault();

		var key = this.readTextValue('key');
		if (key.length === 0) {
			return;
		}
		var defaultValue;
		switch(this.readRadioButtonValue('parameterType')) {
			case 'number':
			defaultValue = 0;
			break;

			case 'boolean':
			defaultValue = true;
			break;

			default:
			defaultValue = '';
		}

		this.props.onCreateParameter(key, defaultValue);
	},

	readTextValue(key) {
		return this.refs[key].getDOMNode().value;
	},

	readRadioButtonValue(key) {
		var buttons = this.refs.form.getDOMNode()[key];
		for (var i = 0; i < buttons.length; ++i) {
			if (buttons[i].checked) {
				return buttons[i].value;
			}
		}
		// buttons.value
		// this.refs.form.getDOMNode().querySelector('input[name=' + key + ']:checked').value
	},

	render() {
		return (
			<form className="dialog-new-parameter" ref="form" onSubmit={this.handleSubmit}>
				<h3>Neuer Parameter</h3>
				<input type="text" ref="key" placeholder="Parametername" required />
				<label><input type="radio" name="parameterType" value="string" defaultChecked />Text</label>
				<label><input type="radio" name="parameterType" value="number" />Zahl</label>
				<label><input type="radio" name="parameterType" value="boolean" />Boolesche Variable</label>
				<div className="actions">
					<button type="submit">OK</button>
					<button type="button" onClick={this.props.onCancel} className="red-button">Abbrechen</button>
				</div>
			</form>
		);
	}

});
module.exports = DetailNewParameterForm;