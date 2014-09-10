// TODO: check if point arguments are of the right type (in dev mode)
// TODO: freeze the object (in dev mode)

class Rect {

	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
	}
	/**
	 * Creates a string-representation of this Rect
	 */
	toString() {
		return 'Rect [ ' + this.x + ', ' + this.y + ' ] [ ' + this.width + ', ' + this.height + ' ]';
	}
	/**
	 * Add the point (or anything point-like) to the current position while keeping the
	 * width and height
	 */
	moveBy(point) {
		return new Rect(
			this.x + point.x,
			this.y + point.y,
			this.width,
			this.height
		);
	}
	/**
	 * Add these values to the current values
	 * All parameters default to zero
	 */
	addValues(x, y, width, height) {
		x = x || 0;
		y = y || 0;
		width = width || 0;
		height = height || 0;
		return new Rect(
			this.x + x,
			this.y + y,
			this.width + width,
			this.height + height
		);
	}
	/**
	 * Checks if another Rect or anything rect-like equals to this Rect
	 */
	equals(other) {
		return this.x      === other.x &&
		       this.y      === other.y &&
		       this.width  === other.width &&
		       this.height === other.height;
	}
	/**
	 * Test whether two Rects intersect each other
	 */
	intersectsRect(other) {
		return this.x               < other.x + other.width  &&
		       this.x + this.width  > other.x                &&
		       this.y               < other.y + other.height &&
		       this.y + this.height > other.y;
	}
	/**
	 * Calculates the length of the diagonal
	 */
	getDiagonalLength() {
		if (this.width === 0) { return this.height; }
		if (this.height === 0) { return this.width; }
		return Math.sqrt(this.width * this.width + this.height * this.height);
	}
	/**
	 * Calculates the area of a square with the side length of the diagonal
	 */
	isDiagonalLengthZero() {
		return this.width === 0 && this.height === 0;
	}

}
Rect.Zero = new Rect(0, 0, 0, 0);
Rect.fromTwoPoints = function createWithPoints(a, b) {
	if (!a || !b) {
		return Rect.Zero;
	}
	var x, y, xfar, yfar;
	if (a.x < b.x) {
		x = a.x; xfar = b.x;
	} else {
		x = b.x; xfar = a.x;
	}
	if (a.y < b.y) {
		y = a.y; yfar = b.y;
	} else {
		y = b.y; yfar = a.y;
	}
	return new Rect(x, y, xfar - x, yfar - y);
}

module.exports = Rect;