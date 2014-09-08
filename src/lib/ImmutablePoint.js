class ImmutablePoint {
	constructor(x, y) {
		console.log('create ImmutablePoint');
		this.x = x || 0;
		this.y = y || 0;
		// TODO: freeze only in dev mode
		Object.freeze(this);
	}
	addPoint(p) {
		return new ImmutablePoint(this.x + p.x, this.y + p.y);
	}
	add(x, y) {
		return new ImmutablePoint(this.x + x, this.y + y);
	}
	distance() {
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}
}
module.exports = ImmutablePoint;