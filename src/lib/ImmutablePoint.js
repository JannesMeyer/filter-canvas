class ImmutablePoint {
	x: 0,
	y: 0,
	constructor(x, y) {
		this.x = x;
		this.y = y;
	}
	addPoint(point) {
		return new ImmutablePoint(this.x + point.x, this.y + point.y);
	}
	add(x, y) {
		return new ImmutablePoint(this.x + x, this.y + y);
	}
	// TODO asMutable()
}
module.exports = ImmutablePoint;