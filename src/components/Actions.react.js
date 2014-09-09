var Actions = React.createClass({
	render() {
		return (
			<div className="m-actions">
				<button>Load file</button>
				<button>Save file</button>
				<button>Undo</button>
				<button>Redo</button>
				<button disabled>Remove selected</button>
				<button disabled>Save selection as filter</button>
			</div>
		);
	}
});
module.exports = Actions;