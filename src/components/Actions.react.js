var Actions = React.createClass({
	render() {
		return (
			<div className="m-actions">
				<button>Import file</button>
				<button>Export file</button>
				<button>Undo</button>
				<button>Redo</button>
				<button disabled>Remove selected</button>
				<button disabled>Save selection as filter</button>
			</div>
		);
	}
});
module.exports = Actions;