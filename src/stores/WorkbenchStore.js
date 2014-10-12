var merge = require('react/lib/merge');
var immutable = require('immutable');
var { Map, Vector } = immutable;
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchLayout = require('../WorkbenchLayout');
var RepositoryStore; // late import
var SelectionStore; // late import
var Dispatcher = require('../flux/Dispatcher');
var Constants = require('../flux/Constants');

// Data
var data = Map({
	items: Vector()
});
var connectorOffsets = {};
var undoStack = [];
var redoStack = [];

var isDragging = false;
var startMousePos;
var itemPositions = Map();

/**
 * Inverts the key/value pairs of an object
 */
// function invert(obj) {
//   var newObject = {}, prop;
//   for (prop in obj) {
//     if (obj.hasOwnProperty(prop)) {
//       newObject[obj[prop]] = prop;
//     }
//   }
//   return newObject;
// }

function makeArray(n, value) {
	var arr = [];
	for (var i = 0; i < n; ++i) {
	  arr.push(value);
	}
	return arr;
}





/**
 * Modify the data object
 */
function setData(newData, options) {
	var options = options || {};
	if (options.undoable === undefined) {
		options.undoable = true;
	}
	if (options.emit === undefined) {
		options.emit = true;
	}

	// Push the current state onto the undo stack
	if (options.undoable) {
		undoStack.push(data);
	} else {
		undoStack = [];
	}
	redoStack = [];

	// Replace the data
	data = newData;

	if (options.emit) {
		WorkbenchStore.emitChange();
	}
}

/**
 * Undo the previous action
 */
function undo() {
	if (undoStack.length === 0) {
		return;
	}
	redoStack.push(data);

	// Change the data object
	data = undoStack.pop();
	WorkbenchStore.emitChange();
}

/**
 * Redo the following action
 */
function redo() {
	if (redoStack.length === 0) {
		return;
	}
	undoStack.push(data);

	// Change the data object
	data = redoStack.pop();
	WorkbenchStore.emitChange();
}

/**
 * WorkbenchStore single object
 * (like a singleton)
 */
var WorkbenchStore = BaseStore.createEventEmitter(['change', 'preliminaryPosition', 'paramChange'], {

	/**
	 * returns an immutable.Vector
	 */
	getAllItems() {
		// Doesn't filter out undefined items
		// (because it would be impossible without converting to a Map)
		return data.get('items');
	},

	/**
	 * returns an immutable.Sequence
	 */
	getAllItemIds() {
		// The Vector could be sparse after elements have been deleted from it
		return data.get('items').toKeyedSeq().filter(Boolean).keySeq();
	},

	/**
	 * returns an immutable.Map
	 */
	getItem(id) {
		return data.getIn(['items', id]);
	},

	/**
	 * returns an immutable.Sequence
	 */
	getItemsCoveredBy(rect) {
		// The Vector could be sparse after elements have been deleted from it
		return data.get('items').toKeyedSeq().filter(item => item && item.get('rect').intersectsRect(rect)).keySeq();
	},

	/**
	 * returns a number
	 */
	getLastIndex() {
		return data.get('items').length - 1;
	},

	/**
	 * returns an immutable.Map
	 */
	getItemParameters(id) {
		return data.getIn(['items', id, 'parameter']);
	},

	/**
	 * returns an ImmutableRect
	 */
	getItemPosition(id) {
		if (isDragging && itemPositions.has(id)) {
			return itemPositions.get(id);
		} else {
			return data.getIn(['items', id, 'rect']);
		}
	},

	/**
	 * Calculates the movement vector
	 */
	// TODO: why not use deltaPos?
	getAmountDragged(mousePos) {
		return mousePos.subtract(startMousePos);
	},

	/**
	 * returns whether any items are being moved right now
	 */
	isDragging() {
		return isDragging;
	},

	/**
	 * Caches the offset values from `WorkbenchLayout.getConnectorOffset()`
	 * address: (immutable.Vector) of a connector
	 */
	getConnectorOffset(address) {
		// Implicitly calls address.toString(), because only Strings
		// can be keys of an Object
		var offset = connectorOffsets[address];
		if (offset) {
			// Return the cached value
			return offset;
		}

		var itemId = address.get(0);
		var isOutput = address.get(1);
		var connectorId = address.get(2);

		// Calculate the offset value
		var item = data.getIn(['items', itemId]);
		if (!item) {
			throw new Error('Invalid item ID');
		}
		var frame = item.get('rect');
		var numConnectors = item.get(isOutput ? 'outputs' : 'inputs').length;
		if (connectorId < 0 || connectorId >= numConnectors) {
			throw new Error('Invalid connector index');
		}

		// Save it to the cache and return it
		return connectorOffsets[address] = WorkbenchLayout.getConnectorOffset(frame, numConnectors, isOutput, connectorId);
	},

	getConnectorPosition(address) {
		var itemPos = this.getItemPosition(address.get(0));
		return itemPos.moveBy(this.getConnectorOffset(address));
	},

	/**
	 * returns a boolean
	 */
	hasUndoSteps() {
		return undoStack.length !== 0;
	},

	/**
	 * returns a boolean
	 */
	hasRedoSteps() {
		return redoStack.length !== 0;
	},

	/**
	 * Will be replaced by a function that returns the scroll offset
	 * of the Workbench that was initialized most recently (there
	 * should be only one Workbench anyway)
	 */
	getScrollOffset: null,

	/**
	 * Exports the current state as a single, portable object that can
	 * be saved to JSON, for example.
	 */
	export() {
		var obj = {
			factoryVersion: '0.2'
		};

		var items = data.get('items').toJS();
		var inputCounter = 1;
		var outputCounter = 1;
		// Filters
		var filterIndexes = {};
		obj.filters = items
			.filter((item, index) => {
				if (!item) {
					return false;
				}
				// Preserve the original index, because after filtering out some
				// elements, the remaining element's indexes will have changed
				item.itemId = index;
				return item.type === Constants.ITEM_TYPE_FILTER;
			})
			.map((filter, index) => {
				filterIndexes[filter.itemId] = index;
				return {
	        filterID: filter.itemId,
	        class: filter.class,
	        parameter: [ filter.parameter ],
	        inputs: filter.inputs.map(cTo => ({ inputID: inputCounter++, type: null })), // TODO: type
	        outputs: filter.outputs.map(cTo => ({ outputID: outputCounter++, type: null })),
	        rect: filter.rect // Saving this information is optional, but enhances the UX
				};
			});

		// TODO: fix the mappings export
		obj.pipes = items
			.filter(item => item && item.type === Constants.ITEM_TYPE_PIPE)
			.map((pipe, index) => {
				var numInputs = pipe.inputs.length;
				var numOutputs = pipe.outputs.length;
				// Equalize the number of inputs and outputs
				if (numInputs === 1 && numInputs < numOutputs) {
					// SplitPipe
					pipe.inputs = makeArray(numOutputs, pipe.inputs[0]);
					numInputs = numOutputs;
				} else if (numOutputs === 1 && numInputs > numOutputs) {
					// JoinPipe
					pipe.outputs = makeArray(numInputs, pipe.outputs[0]);
					numOutputs = numInputs;
				} else if (numInputs !== numOutputs) {
					throw new Error('Unsupported pipe configuration');
				}

				// Populate the mappings array
				var mappings = [];
				for (var i = 0; i < numInputs; ++i) {
					var inputTo = pipe.inputs[i];
					var outputTo = pipe.outputs[i];
					if (!inputTo || !outputTo) {
						console.warn('Unconnected pipe connector');
						continue;
					}
					// These names are a bit weird, but that's how the file format is specified
					var inFilter = inputTo[0];
					var output = obj.filters[filterIndexes[inFilter]].outputs[inputTo[2]].outputID;
					var outFilter = outputTo[0];
					var input = obj.filters[filterIndexes[outFilter]].inputs[outputTo[2]].inputID;
					mappings.push({ inFilter, output, outFilter, input });
				}

				// Return pipe
				return {
					pipeID: index,
					type: pipe.class,
					parameter: [ pipe.parameter ],
					mappings,
					rect: pipe.rect // Saving this information is optional, but enhances the UX
				};
			});

		return obj;
	}

});

WorkbenchStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {

		case Constants.IMPORT_FILE:
			// In case somebody is subscribed to WorkbenchStore and SelectionStore
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// Since we're resetting the ID namespace, we have to clear the cache
			connectorOffsets = {};

			// Load data
			setData(importFile(action.obj));
		break;

		case Constants.CREATE_ITEM:
			if (action.type === Constants.ITEM_TYPE_FILTER) {
				addFilter(action.id, action.position);
			} else if (action.type === Constants.ITEM_TYPE_PIPE) {
				addPipe(action.id, action.position);
			} else {
				throw new Error('Invalid item type');
			}
		break;

		case Constants.SET_ITEM_INPUTS:
		case Constants.SET_ITEM_OUTPUTS:
			var item = data.getIn(['items', action.id]);
			var numInputs = item.get('inputs').length;
			var numOutputs = item.get('outputs').length;

			var deltaInputs = 0;
			var deltaOutputs = 0;

			if (action.numInputs > 0) {
				// Join pipe
				deltaInputs = action.numInputs - numInputs;
			}
			if (item.get('variableInputs') && item.get('variableOutputs')) {
				// Forward pipe
				deltaOutputs = deltaInputs;
			}
			if (action.numOutputs > 0) {
				// Split pipe
				deltaOutputs = action.numOutputs - numOutputs;
			}
			// TODO: delete connector offset cache

			setData(data.withMutations(data => {
				// Inputs
				data.updateIn(['items', action.id, 'inputs'], inputs => inputs.withMutations(inputs => {
					for (; deltaInputs > 0; --deltaInputs) {
						inputs.push(undefined);
					}
					for (; deltaInputs < 0; ++deltaInputs) {
						if (inputs.last()) {
							// TODO: delete connection
							console.log('we have to delete a connection here');
						}
						inputs.pop();
					}
				}));

				// Outputs
				data.updateIn(['items', action.id, 'outputs'], outputs => outputs.withMutations(outputs => {
					for (; deltaOutputs > 0; --deltaOutputs) {
						outputs.push(undefined);
					}
					for (; deltaOutputs < 0; ++deltaOutputs) {
						if (outputs.last()) {
							// TODO: delete connection
							console.log('we have to delete a connection here');
						}
						outputs.pop();
					}
				}));
			}));

			// TODO: rename this to something more appropriate
			WorkbenchStore.emitParamChange();
		break;

		case Constants.SET_ITEM_PARAMS:
			var id = action.id;
			var params = action.params;
			setData(data.updateIn(['items', id, 'parameter'], params => params.merge(action.params)));
			WorkbenchStore.emitParamChange();
		break;

		case Constants.REMOVE_ITEM_PARAM:
			setData(data.updateIn(['items', action.id, 'parameter'], params => params.remove(action.param)));
			WorkbenchStore.emitParamChange();
		break;

		case Constants.MOVE_SELECTED_ITEMS_BY:
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta).clipNegative());
				});
			}));
		break;

		case Constants.DELETE_SELECTED_ITEMS:
			var deleteItems = action.selectedItems;
			if (deleteItems.length === 0) {
				break;
			}

			// In case somebody is subscribed to WorkbenchStore and SelectionStore
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			setData(data.updateIn(['items'], items => items.withMutations(items => {
				// Clear connections (they work similar to doubly linked lists)
				var clearConnectors = immutable.Sequence();
				deleteItems.forEach(itemId => {
					var item = data.getIn(['items', itemId]);
					clearConnectors = clearConnectors.concat(item.get('inputs'));
					clearConnectors = clearConnectors.concat(item.get('outputs'));
				});
				clearConnectors.forEach(address => {
					if (!address || deleteItems.has(address.get(0))) { return; }
					items.updateIn([address.get(0), (address.get(1) ? 'outputs' : 'inputs'), address.get(2)], () => undefined);
				});

				// Delete items
				deleteItems.forEach(itemId => {
					items.remove(itemId);
				});
			})));
		break;

		case Constants.DELETE_ALL_ITEMS:
			// In case somebody is subscribed to WorkbenchStore and SelectionStore
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			setData(data.updateIn(['items'], items => items.clear()));
			// Since we're resetting the ID namespace, we have to clear the cache
			connectorOffsets = {};
		break;

		case Constants.FINISH_CONNECTION:
			addConnection(action.from, action.to);
		break;

		case Constants.DELETE_CONNECTION:
			var c1 = action.connector1;
			var c2 = action.connector2;
			setData(data.withMutations(data => {
				data.updateIn(['items', c1.get(0), (c1.get(1) ? 'outputs' : 'inputs'), c1.get(2)], () => undefined);
				data.updateIn(['items', c2.get(0), (c2.get(1) ? 'outputs' : 'inputs'), c2.get(2)], () => undefined);
			}));
		break;

		case Constants.UNDO:
			undo();

			// Wait for the SelectionStore to update before emitting an event,
			// because it is possible that a selected item was removed.
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// It's possible that one of the parameters changed
			WorkbenchStore.emitParamChange();
		break;

		case Constants.REDO:
			redo();

			// Wait for the SelectionStore to update before emitting an event,
			// because it is possible that a selected item was removed.
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// It's possible that one of the parameters changed
			WorkbenchStore.emitParamChange();
		break;

		case Constants.START_MOVING_SELECTED_ITEMS:
			isDragging = true;
			startMousePos = action.mousePos;
		break;

		case Constants.MOVING_SELECTED_ITEMS:
			var delta = action.mousePos.subtract(startMousePos);
			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']).moveBy(delta);
			}).toMap();
			WorkbenchStore.emitPreliminaryPosition();
		break;

		case Constants.FINISH_MOVING_SELECTED_ITEMS:
			isDragging = false;
			itemPositions = itemPositions.clear();
			// The actual moving is done in MOVE_SELECTED_ITEMS_BY
		break;
	}
});

module.exports = WorkbenchStore;

// Requiring after the export prevents problems with circular dependencies
RepositoryStore = require('./RepositoryStore');
SelectionStore = require('./SelectionStore');








/*************************************************************************
 * Item adding
 *************************************************************************/

function importFile(obj) {
	var items = [];
	var outputToConnector = {};
	var inputToConnector = {};

	obj.filters.forEach(filter => {
		var id = items.length;
		var numInputs = filter.inputs.length;
		var numOuputs = filter.outputs.length;
		var rect;
		if (filter.rect) {
			rect = Rect.fromObject(filter.rect);
		} else {
			rect = WorkbenchLayout.getFilterFrame(100, 100, filter.class, numInputs, numOuputs);
		}
		items[id] = {
			type: Constants.ITEM_TYPE_FILTER,
			class: filter.class,
			parameter: filter.parameter[0] || {},
			inputs: new Array(numInputs),
			outputs: new Array(numOuputs),
			rect
		};
		filter.inputs.forEach((input, connectorId) => {
			inputToConnector[input.inputID] = [id, 0, connectorId];
		});
		filter.outputs.forEach((output, connectorId) => {
			outputToConnector[output.outputID] = [id, 1, connectorId];
		});
	});

	obj.pipes.forEach(pipe => {
		var id = items.length;
		var numMappings = pipe.mappings.length;
		// TODO: recognize split/join pipes
		var rect;
		if (pipe.rect) {
			rect = Rect.fromObject(pipe.rect);
		} else {
			rect = WorkbenchLayout.getPipeFrame(200, 200, pipe.type, numMappings, numMappings);
		}
		items[id] = {
			type: Constants.ITEM_TYPE_PIPE,
			class: pipe.type,
			parameter: pipe.parameter[0] || {},
			// TODO: inputNum and outputNum TO BE DETERMINED for split/join pipes
			inputs: new Array(numMappings),
			outputs: new Array(numMappings),
			rect
		};

		// Create connections out of the mappings
		pipe.mappings.forEach((mapping, connectorId) => {
			var filterOut = outputToConnector[mapping.output];
			var pipeIn    = [id, 0, connectorId];
			var pipeOut   = [id, 1, connectorId];
			var filterIn  = inputToConnector[mapping.input];

			// Check for duplicate connection
			var p1 = items[filterOut[0]].outputs[filterOut[2]];
			var p2 = items[filterIn[0]].inputs[filterIn[2]];
			if (p1 || p2) {
				throw new Error('Es wurde versucht, mehrmals den gleichen Input/Output zu verbinden.');
			}

			// First connection (doubly linked)
			items[filterOut[0]].outputs[filterOut[2]] = pipeIn;
			items[pipeIn[0]].inputs[pipeIn[2]] = filterOut;

			// Second connection (doubly linked)
			items[pipeOut[0]].outputs[pipeOut[2]] = filterIn;
			items[filterIn[0]].inputs[filterIn[2]] = pipeOut;
		});
	});

	return data.updateIn(['items'], _ => immutable.fromJS(items));
}

function addFilter(name, position, parameter) {
	var f = RepositoryStore.getFilter(name);
	if (!f) {
		throw new Error('The filter class doesn\'t exist');
	}

	var item = Map({
		type: Constants.ITEM_TYPE_FILTER,
		class: name,
		inputs: Vector().setLength(f.inputs),
		outputs: Vector().setLength(f.outputs),
		parameter: Map(f.parameter).merge(parameter),
		rect: WorkbenchLayout.getFilterFrame(position.x, position.y, name, f.inputs, f.outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}

function addPipe(name, position, parameter) {
	var p = RepositoryStore.getPipe(name);
	if (!p) {
		throw new Error('The pipe class doesn\'t exist');
	}
	var item = Map({
		type: Constants.ITEM_TYPE_PIPE,
		class: name,
		inputs: Vector().setLength(p.inputs),
		outputs: Vector().setLength(p.outputs),
		minInputs: p.inputs,
		minOutputs: p.outputs,
		variableInputs: Boolean(p.variableInputs),
		variableOutputs: Boolean(p.variableOutputs),
		parameter: Map(p.parameter).merge(parameter),
		rect: WorkbenchLayout.getPipeFrame(position.x, position.y, name, p.inputs, p.outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}


function addConnection(output, input) {
	// If they arrive in reverse order swap them
	if (!output.get(1) && input.get(1)) {
		[input, output] = [output, input];
	}

	var p1 = data.getIn(['items', output.get(0), 'outputs', output.get(2)]);
	var p2 = data.getIn(['items', input.get(0), 'inputs', input.get(2)]);
	if (p1) {
		throw new Error('The connector ' + p1 + ' already has a connection');
	}
	if (p2) {
		throw new Error('The connector ' + p2 + ' already has a connection');
	}

	setData(data.withMutations(data => {
		data.updateIn(['items', output.get(0), 'outputs', output.get(2)], () => Vector.from(input));
		data.updateIn(['items', input.get(0), 'inputs', input.get(2)], () => Vector.from(output));
	}));
}




/*************************************************************************
 * Testing
 *************************************************************************/

// TODO: put this in the APP.react.js

// Restore from localStore
if (window.localStorage && localStorage.dataBackup) {
	console.log('Restoring state from local storage…');
	try {
		var obj = JSON.parse(localStorage.dataBackup);

		// Restore the ImmutableRect objects
		obj.items.forEach((item, itemId) => {
			if (item) {
				item.rect = Rect.fromObject(item.rect);
			}
		});

		data = immutable.fromJS(obj);
	} catch (e) {
		// Start with an empty canvas
		localStorage.removeItem('dataBackup');
		console.warn(e);
	}
}

// Save the current state to localStorage whenever the tab is hidden
// or when it is unloaded
if (window.localStorage) {
	var save = function() {
		if (data.get('items').length === 0) {
			localStorage.removeItem('dataBackup');
			return;
		}
		console.log('Saving state to local storage…');
		localStorage.dataBackup = JSON.stringify(data.toJS());
	};
	document.addEventListener('visibilitychange', () => {
		if (document.hidden || document.msHidden) {
			save();
		}
	});
	// This could be dangerous in case the state gets corrupted.
	// It would always write the corrupted state back on reload.
	window.addEventListener('unload', save);
}

// var Point = require('../lib/ImmutablePoint');
// addFilter('SourceFilterExample', new Point(20, 20));
// addFilter('WorkFilterExample',   new Point(20, 90));
// addFilter('EndFilter',           new Point(508, 141));
// addFilter('WorkFilterExample',   new Point(20,  230));
// addPipe('ForwardPipe',           new Point(300, 150), { cardinality: 3 });
// addFilter('WorkFilterExample',   new Point(60, 380));
// addPipe('ForwardPipe',           new Point(350, 250));
// addPipe('ForwardPipe',           new Point(450, 250));
// addFilter('WorkFilterExample',   new Point(400,  380));

// addConnection(Vector(0, 1, 0), Vector(4, 0, 0));
// addConnection(Vector(1, 1, 0), Vector(4, 0, 1));
// addConnection(Vector(3, 1, 0), Vector(4, 0, 2));

// addConnection(Vector(4, 1, 0), Vector(2, 0, 0));
// addConnection(Vector(4, 1, 1), Vector(2, 0, 1));
// addConnection(Vector(4, 1, 2), Vector(5, 0, 0));
// addConnection(Vector(5, 1, 0), Vector(6, 0, 0));
// addConnection(Vector(6, 1, 0), Vector(2, 0, 2));