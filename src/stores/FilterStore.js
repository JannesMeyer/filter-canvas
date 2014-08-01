'use strict';

module.exports = Fluxxor.createStore({
	initialize() {
		this.filters = Immutable.fromJS({
			'Header 1': { content: 'Content 1', x: 20, y: 24 },
			'Header 2': { content: 'Content 2', x: 20, y: 24 + 1 * 80 },
			'Header 3': { content: 'Content 3', x: 20, y: 24 + 2 * 80 },
			'Header 4': { content: 'Content 4', x: 20, y: 24 + 3 * 80 },
			'Header 5': { content: 'Content 5', x: 20, y: 24 + 4 * 80 }
		});

		this.bindActions(
			'DROP_FILTER', this.dropFilter
		);
	},
	dropFilter(data) {
		this.filters = this.filters.withMutations(function(filters) {
			filters.updateIn([data.key, 'x'], prev => data.x);
			filters.updateIn([data.key, 'y'], prev => data.y);
		});
		// No re-render needed! Because we already update the position
		this.emit('change');
	}
});