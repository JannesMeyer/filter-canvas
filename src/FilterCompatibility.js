/**
 * Tests the compatibility between two filters
 *
 * fromFilter: the class of the first filter (string)
 * fromIndex: the index of the output (number)
 * toFilter: the class of the second filter (string)
 * toIndex: the index of the input (number)
 */
function test(fromFilter, fromIndex, toFilter, toIndex) {
	console.log('Testing compatibility between', fromFilter+'['+fromIndex+'] – '+toFilter+'['+toIndex+']');

	// if (fromFilter === 'SourceFilterExample' && toFilter === 'EndFilterExample') {
	// 	return false;
	// }

	return true;
}

module.exports.test = test;