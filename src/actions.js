'use strict';

var actions = {
	dropFilter(key, x, y) {
		this.dispatch('DROP_FILTER', { key, x, y });
	}
};
module.exports = actions;