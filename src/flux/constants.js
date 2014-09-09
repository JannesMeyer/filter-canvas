var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
	IMPORT_FILE: null,
	EXPORT_FILE: null,
	UNDO: null,
	REDO: null,
	CREATE_FILTER: null,
	CREATE_PIPE: null,
	REMOVE_SELECTED_ITEMS: null,
	SAVE_SELECTION_AS_FILTER: null,

	START_DRAG_ON_WORKBENCH: null,
	DRAGGING_ON_WORKBENCH: null,
	END_DRAG_ON_WORKBENCH: null,

	MOVE_BY_ON_WORKBENCH: null,
	ITEM_CLICKED_ON_WORKBENCH: null,

	START_SELECTION: null,
	MOVE_SELECTION: null,
	END_SELECTION: null
});