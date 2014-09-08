class ImmutableRect {

	constructor(x, y, width, height) {
		console.log('create ImmutableRect');
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
		// TODO: freeze only in dev mode
		Object.freeze(this);
	}

	moveTo(x, y) {
		return new ImmutableRect(x, y, this.width, this.height);
	}

	moveBy(x, y) {
		return new ImmutableRect(this.x + x, this.y + y, this.width, this.height);
	}

	intersects(otherRect) {
		return this.x               < otherRect.x + otherRect.width  &&
		       this.x + this.width  > otherRect.x                    &&
		       this.y               < otherRect.y + otherRect.height &&
		       this.y + this.height > otherRect.y;
	}

	getDiagonalLength() {
		if (this.width === 0) { return this.height; }
		if (this.height === 0) { return this.width; }
		return Math.sqrt(this.width * this.width + this.height * this.height);
	}

	getDiagonalSquare() {
		return this.width * this.width + this.height * this.height;
	}

}
module.exports = ImmutableRect;