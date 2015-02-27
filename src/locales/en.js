export default {
	introduction_1: 'You can move these building blocks onto the workbench by drag and drop.',
	introduction_2: 'Then you can connect one block\'s output with another\'s input. But you cannot connect two filters directly, you always need a pipe in between.',
	introduction_multiselect: 'Select multiple elements by dragging a selection rectangle.',
	errors: {
		invalid_file: 'Invalid file:\n%(message)s',
		unsaved_changes: 'You have unsaved changes.',
		incompatible_filters: 'The filters „%(fromFilter)s“ and „%(toFilter)s“ are not compatible.',
		no_network: 'Connection failed'
	},
	actions: {
		'new': 'New',
		'import': 'Import',
		filename: 'configuration',
		'export': 'Export',
		undo: 'Undo',
		redo: 'Redo'
	},
	detail_pane: {
		headline: {
			zero:  'No elements selected',
			one:   '1 element selected',
			other: '%(count)s elements selected'
		},
		'delete': {
			one: 'Delete Element',
			other: 'Delete Elements'
		},
		new_parameter: 'New Parameter',
		save_complex_filter: 'Save as a komplex filter'
	},
	new_parameter: {
		name: 'Parameter name',
		type_text: 'Text',
		type_number: 'Number',
		type_bool: 'Boolean'
	},
	repository_pane: {
		pipes: 'Pipes',
		pumps: 'Pumps',
		filters: 'Filters',
		sinks: 'Sinks',
		complex_filters: 'Complex Filters'
	},
	dialog: {
		ok: 'OK',
		cancel: 'Cancel',
		apply: 'Apply changes'
	}
};