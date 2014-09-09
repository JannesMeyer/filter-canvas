class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
		// Freeze only in dev mode
		// Object.freeze(this);
	}
	/**
	 * Creates a string-representation of this Point
	 */
	toString() {
		return 'Point [ ' + this.x + ', ' + this.y + ' ]';
	}
	/**
	 * Add a Point or anything point-like (i.e. it has an `x` and a `y`)
	 */
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}
	/**
	 * Subtract a Point or anything point-like (i.e. it has an `x` and a `y`)
	 */
	subtract(point) {
		return new Point(this.x - point.x, this.y - point.y);
	}
	/**
	 * Calculates the distance from the origin [0, 0]
	 */
	getDistanceFromOrigin() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

}
module.exports = Point;