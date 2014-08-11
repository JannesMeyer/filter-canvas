'use strict';

module.exports = function(source) {
	this.cacheable();
	return '\'use strict\';\n' + source;
};