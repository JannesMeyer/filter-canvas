class MutableRect {

	constructor(x, y, width, height) {
		this.x = x || 0;
		this.y = y || 0;
		this.width = width || 0;
		this.height = height || 0;
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

}
module.exports = MutableRect;