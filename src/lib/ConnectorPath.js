class ConnectorPath {

	constructor(item, isOutput, connector) {
		this.item = item;
		this.isOutput = isOutput;
		this.connector = connector;
	}

	toString() {
		return this.item + '.' + this.isOutput + '.' + this.connector;
	}

}
module.exports = ConnectorPath;