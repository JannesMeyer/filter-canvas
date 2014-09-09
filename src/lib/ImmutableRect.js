class Rect {

	constructor(x, y, width, height) {
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;
		// TODO: freeze only in dev mode
		// Object.freeze(this);
		// console.log('Rect()');
	}
	toString() {
		return 'Rect [ ' + this.x + ', ' + this.y + ' ] [ ' + this.width + ', ' + this.height + ' ]';
	}
	moveTo(x, y) {
		return new Rect(x, y, this.width, this.height);
	}
	moveBy(point) {
		return new Rect(this.x + point.x, this.y + point.y, this.width, this.height);
	}
	/**
	 * Can use an ImmutablePoint or anything point-like (i.e. that has an `x` and a `y`)
	 */
	addPoint(point) {
		return new Rect(
			this.x + point.x,
			this.y + point.y,
			this.width,
			this.height
		);
	}
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
	intersectsRect(other) {
		return this.x               < other.x + other.width  &&
		       this.x + this.width  > other.x                &&
		       this.y               < other.y + other.height &&
		       this.y + this.height > other.y;
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
Rect.Zero = new Rect(0, 0, 0, 0);
Rect.createFromTwoPoints = function createWithPoints(a, b) {
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