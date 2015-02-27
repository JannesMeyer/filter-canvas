import pluralize from 'counterpart/node_modules/pluralizers/en';

export default {
  counterpart: { pluralize },
	errors: {
		invalid_file: 'Ungültige Datei:\n%(message)s',
		unsaved_changes: 'Es gibt ungespeicherte Änderungen.',
		incompatible_filters: 'Die Filter „%(fromFilter)s“ und „%(toFilter)s“ sind leider nicht miteinander kompatibel.',
		no_network: 'Verbindungs-Fehler'
	},
	actions: {
		'new': 'Neu',
		'import': 'Importieren',
		'export': 'Exportieren',
		undo: 'Rückgängig',
		redo: 'Wiederholen'
	},
	detail_pane: {
		headline: {
			zero:  'Keine Elemente markiert',
			one:   '1 Element markiert',
			other: '%(count)s Elemente markiert'
		},
		'delete': {
			one: 'Element löschen',
			other: 'Elemente löschen'
		},
		new_parameter: 'Neuer Parameter',
		save_complex_filter: 'Als komplexen Filter speichern'
	},
	new_parameter: {
		name: 'Parametername',
		type_text: 'Text',
		type_number: 'Zahl',
		type_bool: 'Boolesche Variable'
	},
	repository_pane: {
		pipes: 'Pipes',
		pumps: 'Pumpen',
		filters: 'Filter',
		sinks: 'Becken',
		complex_filters: 'Komplexe Filter'
	},
	dialog: {
		ok: 'OK',
		cancel: 'Abbrechen',
		apply: 'Übernehmen'
	}
};