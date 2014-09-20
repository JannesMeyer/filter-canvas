/**
 * Workbench path descriptor
 * It can point to:
 *  item:                        An item
 *  item + isOutput:             An item's inputs/outputs
 *  item + isOutput + connector: A specific input/output
 */
class WPath {

	constructor(item, isOutput, connector) {
		if (item === undefined) {
			throw new Error('An item ID is required');
		}
		this.item = item;
		this.isOutput = isOutput;
		this.connector = connector;
	}

	toString() {
		var res = this.item;

		if (this.isOutput === undefined) {
			return res;
		}
		res += '.' + this.isOutput;

		if (this.connector === undefined) {
			return res;
		}
		res += '.' + this.connector;

		return res;
	}

}
module.exports = WPath;