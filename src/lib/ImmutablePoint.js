// TODO: check if point arguments are of the right type (in dev mode)
// TODO: freeze the object (in dev mode)

class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
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
	addValues(x, y) {
		return new Point(this.x + x, this.y + y);
	}
	/**
	 * Subtract a Point or anything point-like (i.e. it has an `x` and a `y`)
	 */
	subtract(point) {
		return new Point(this.x - point.x, this.y - point.y);
	}
	/**
	 * Checks if a Point or anything point-like (i.e. it has an `x` and a `y`)
	 * equals to this Point
	 */
	equals(other) {
		return this.x === other.x && this.y === other.y;
	}
	/**
	 * Calculates the distance from the origin [0, 0]
	 */
	getDistanceFromOrigin() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	/**
	 * Checks whether this point is in the origin [0, 0]
	 */
	isZero() {
		return this.x === 0 && this.y === 0;
	}

}
module.exports = Point;