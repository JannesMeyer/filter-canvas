'use strict';

var actions = {
	filterDidMount(key, domNode) {
		this.dispatch('FILTER_DID_MOUNT', { key, domNode });
	},
	dropFilter(key, x, y) {
		this.dispatch('DROP_FILTER', { key, x, y });
	}
};
module.exports = actions;