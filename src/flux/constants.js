var keyMirror = require('react/lib/keyMirror');

module.exports = keyMirror({
	IMPORT_FILE: null,
	EXPORT_FILE: null,
	UNDO: null,
	REDO: null,
	CREATE_ITEM: null,
	SET_ITEM_PARAMS: null,
	REMOVE_ITEM_PARAM: null,
	SELECT_ALL: null,

	START_MOVING_SELECTED_ITEMS: null,
	MOVING_SELECTED_ITEMS: null,
	FINISH_MOVING_SELECTED_ITEMS: null,

	MOVE_SELECTED_ITEMS_BY: null,
	SAVE_SELECTED_ITEMS_AS_FILTER: null,
	DELETE_SELECTED_ITEMS: null,
	CLEAR_SELECTED_ITEMS: null,
	DELETE_ALL_ITEMS: null,

	START_SELECTION: null,
	RESIZE_SELECTION: null,
	FINISH_SELECTION: null,
	CANCEL_SELECTION: null,

	START_CONNECTION: null,
	RESIZE_CONNECTION: null,
	FINISH_CONNECTION: null,
	CANCEL_CONNECTION: null,
	DELETE_CONNECTION: null,

	ITEM_TYPE_FILTER: null,
	ITEM_TYPE_PIPE: null,
	SELECTION_TYPE_NEW: null,
	SELECTION_TYPE_EXTEND: null
});