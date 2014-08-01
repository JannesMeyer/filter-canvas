'use strict';

var Immutable = require('immutable');
var constants = require('../constants');

module.exports = Fluxxor.createStore({
	initialize() {
		this.filter = Immutable.fromJS({
			'Header 1': { content: 'Content 1', x: 20, y: 24, domNode: null },
			'Header 2': { content: 'Content 2', x: 20, y: 24 + 1 * 80, domNode: null },
			'Header 3': { content: 'Content 3', x: 20, y: 24 + 2 * 80, domNode: null },
			'Header 4': { content: 'Content 4', x: 20, y: 24 + 3 * 80, domNode: null },
			'Header 5': { content: 'Content 5', x: 20, y: 24 + 4 * 80, domNode: null }
		});
		this.dragging = false;

		this.bindActions(
			constants.START_DRAG, this.onStartDrag,
			constants.FILTER_DID_MOUNT, this.filterDidMount
		);
	},
	filterDidMount(filter) {
		this.filter = this.filter.updateIn([filter.key, 'domNode'], prev => filter.domNode);
	},
	onStartDrag() {
		this.dragging = true;
		this.emit('change');
	},
	getDragging() {
		return this.dragging;
	}
});