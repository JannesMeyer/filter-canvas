class Point {

	constructor(x, y) {
		this.x = x;
		this.y = y;
		// TODO: freeze only in dev mode
		// Object.freeze(this);
		// console.log('Point()');
	}
	toString() {
		return 'Point [ ' + this.x + ', ' + this.y + ' ]';
	}
	add(point) {
		return new Point(this.x + point.x, this.y + point.y);
	}
	addValues(x, y) {
		return new Point(this.x + x, this.y + y);
	}
	substract(point) {
		return new Point(this.x - point.x, this.y - point.y);
	}
	substractValues(x, y) {
		return new Point(this.x - x, this.y - y);
	}
	distanceFromOrigin() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

}
module.exports = Point;