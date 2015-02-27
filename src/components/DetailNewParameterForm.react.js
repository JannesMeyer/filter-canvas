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
				<h3>{translate('detail_pane.new_parameter')}</h3>
				<input type="text" ref="key" placeholder={translate('new_parameter.name')} required />
				<label><input type="radio" name="parameterType" value="string" defaultChecked />{translate('new_parameter.type_text')}</label>
				<label><input type="radio" name="parameterType" value="number" />{translate('new_parameter.type_number')}</label>
				<label><input type="radio" name="parameterType" value="boolean" />{translate('new_parameter.type_bool')}</label>
				<div className="actions">
					<button type="submit">{translate('dialog.ok')}</button>
					<button type="button" onClick={this.props.onCancel} className="red-button">{translate('dialog.cancel')}</button>
				</div>
			</form>
		);
	}

});
module.exports = DetailNewParameterForm;