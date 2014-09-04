class MutablePoint {
	x: 0,
	y: 0,
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	addPoint(point) {
		this.x += point.x;
		this.y += point.y;
	}
	add(x, y) {
		this.x += x;
		this.y += y;
	}
	distance() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
	// TODO asImmutable
}
module.exports = MutablePoint;