class MutablePoint {
	x: 0,
	y: 0,
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	addPoint(p) {
		return new MutablePoint(this.x + p.x, this.y + p.y);
	}
	add(x, y) {
		return new MutablePoint(this.x + x, this.y + y);
	}
	addPointToThis(point) {
		this.x += point.x;
		this.y += point.y;
	}
	addToThis(x, y) {
		this.x += x;
		this.y += y;
	}
	distance() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}
module.exports = MutablePoint;