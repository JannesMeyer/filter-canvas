

var WPipe = React.createClass({
	render() {
		return (
			<div className={'pipe' + selected} style={style} onMouseDown={this.handleMouseDown}>
				<h4>{filter.get('class')}</h4>
				<WFilterConnectors type="inputs" connectors={filter.get('inputs')} />
				<WFilterConnectors type="outputs" connectors={filter.get('outputs')} />
			</div>
		);
	}
});