var CreateConnectionStore = require('../stores/CreateConnectionStore');

var Connector = React.createClass({

	getInitialState: function() {
		return {
			eligibleTarget: CreateConnectionStore.isEligibleTarget(this.props.address),
			mouseOver: CreateConnectionStore.isMouseOver(this.props.address)
		};
	},

	componentDidMount() {
		CreateConnectionStore.addChangeListener(this._handleChange);
	},

	componentWillUnmount() {
		CreateConnectionStore.removeChangeListener(this._handleChange);
	},

	render() {
		var classes = 'connector';
		if (this.state.eligibleTarget) {
			classes += ' glow';
		}
		if (this.state.mouseOver) {
			classes += ' mouseover';
		}
		return <div className={classes} onMouseDown={this.props.onMouseDown} />;
	},

	_handleChange() {
		this.replaceState(this.getInitialState());
	}

});
module.exports = Connector;