import keyMirror from 'react/lib/keyMirror';

/**
 * An object containing mostly the action types that can be dispatched through
 * the Dispatcher. These constants are basically only used for equality checks
 * to find out which type of action was received.
 *
 * The keyMirror function will make all values to be exactly the same as the key
 * (i.e. a String that contains the name of the constant)
 *
 * @see AppActions
 * @see WorkbenchStore
 * @see SelectionStore
 * @see RepositoryStore
 * @see CreateConnectionStore
 */
var Constants = keyMirror({
	// Action types
	RELOAD_REPOSITORY: null,
	IMPORT_FILE: null,
	EXPORT_FILE: null,
	UNDO: null,
	REDO: null,
	CREATE_ITEM: null,
	SET_ITEM_INPUTS: null,
	SET_ITEM_OUTPUTS: null,
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

	// Item types
	ITEM_TYPE_FILTER: null,
	ITEM_TYPE_PIPE: null,

	// Selection types
	SELECTION_TYPE_NEW: null,
	SELECTION_TYPE_EXTEND: null,

	// Change UI language
	CHANGE_UI_LANGUAGE: null
});
export default Constants;