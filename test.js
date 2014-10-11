var i = require('immutable');

function fixSparseVector(vector) {
	return vector.withMutations(function(items) {
		items.forEach(function(item, index) {
			if (item) { return; }
			items.remove(index);
		});
	});
}

var data = i.fromJS({
	items: [ { name: 'Test' }, null, { name: 'Another test' } ]
});

data = data.updateIn(['items'], function(items) {
	return fixSparseVector(items);
});

console.log(data.get('items').length);
console.log(data.get('items').toString());