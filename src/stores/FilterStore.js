module.exports = Fluxxor.createStore({
	initialize() {
		this.filters = Immutable.fromJS({
			'Filter 1': { content: '', x: 20, y: 20+0*65 },
			'Filter 2': { content: '', x: 20, y: 20+1*65 },
			'Filter 3': { content: '', x: 20, y: 20+2*65 },
			'Filter 4': { content: '', x: 20, y: 20+3*65 },
			'Filter 5': { content: '', x: 20, y: 20+4*65 },
			'Filter 6': { content: '', x: 20, y: 20+5*65 },
			'Filter 7': { content: '', x: 20, y: 20+6*65 },
			'Filter 8': { content: '', x: 20, y: 20+7*65 },
			'Filter 9': { content: '', x: 20, y: 20+8*65 },
		});

		this.bindActions(
			'DROP_FILTER', this.dropFilter
		);
	},
	dropFilter(data) {
        this.filters = this.filters.withMutations(function (filters) {
            filters.updateIn([data.key, 'x'], () => data.x);
            filters.updateIn([data.key, 'y'], () => data.y);
        });
        // No re-render needed!
        // this.emit('change');
    }
});