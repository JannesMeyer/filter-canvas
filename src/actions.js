'use strict';

var constants = require('./constants');

function startDrag(key, clientX, clientY) {
	this.dispatch(constants.START_DRAG, { key, clientX, clientY });
}
exports.startDrag = startDrag;

function filterDidMount(key, domNode) {
	this.dispatch(constants.FILTER_DID_MOUNT, { key, domNode });
}
exports.filterDidMount = filterDidMount;