import pluralize from 'counterpart/node_modules/pluralizers/en';

export default {
  counterpart: { pluralize },
	errors: {
		invalid_file: 'Archivo inválido:\n%(message)s',
		unsaved_changes: 'Hay cambios no guardados.',
		incompatible_filters: 'Los filtros „%(fromFilter)s“ y „%(toFilter)s“ no son compatibles.',
		no_network: 'Fallo de la conexión'
	},
	actions: {
		'new': 'Nuevo',
		'import': 'Importar',
		'export': 'Exportar',
		undo: 'Deshacer',
		redo: 'Rehacer'
	},
	detail_pane: {
		headline: {
			zero:  'No elementos seleccionados',
			one:   '1 elemento seleccionado',
			other: '%(count)s elementos seleccionados'
		},
		'delete': {
			one: 'Borrar elemento',
			other: 'Borrar elementos'
		},
		new_parameter: 'Parámetro nuevo',
		save_complex_filter: 'Guardar como filtro complexo'
	},
	new_parameter: {
		name: 'Nombre del parámetro',
		type_text: 'Texto',
		type_number: 'Número',
		type_bool: 'Booleano'
	},
	repository_pane: {
		pipes: 'Tubería',
		pumps: 'Bombas',
		filters: 'Filtros',
		sinks: 'Sumideros',
		complex_filters: 'Filtros complejos'
	},
	dialog: {
		ok: 'OK',
		cancel: 'Cancelar',
		apply: 'Aplicar'
	}
};