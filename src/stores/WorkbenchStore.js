var immutable = require('immutable');
var { Map, Vector } = immutable;
var Rect = require('../lib/ImmutableRect');
var BaseStore = require('../lib/BaseStore');
var WorkbenchLayout = require('../WorkbenchLayout');
var FilterCompatibility = require('../FilterCompatibility');
var RepositoryStore; // late import
var SelectionStore; // late import
var CreateConnectionStore; // late import
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

		// Filters export
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

		// Pipes export
		obj.pipes = items
			.filter(item => item && item.type === Constants.ITEM_TYPE_PIPE)
			.map((pipe, index) => {
				var numInputs = pipe.inputs.length;
				var numOutputs = pipe.outputs.length;
				var origInputs = numInputs;
				var origOutputs = numOutputs;

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
						mappings.push(null);
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
				var result = {
					pipeID: index,
					type: pipe.class,
					parameter: [ pipe.parameter ],
					mappings,
					rect: pipe.rect // Saving this information is optional, but enhances the UX
				};
				result.numInputs = origInputs;
				result.numOutputs = origOutputs;
				// save minInputs, minOutputs
				if (pipe.minInputs !== undefined) {
					result.minInputs = pipe.minInputs;
				}
				if (pipe.minOutputs !== undefined) {
					result.minOutputs = pipe.minOutputs;
				}
				// save variableInputs, variableOutputs
				if (pipe.variableInputs !== undefined) {
					result.variableInputs = pipe.variableInputs;
				}
				if (pipe.variableOutputs !== undefined) {
					result.variableOutputs = pipe.variableOutputs;
				}
				return result;
			});

		return obj;
	},


	/**
	 * Tries to import data that was backed up to localStorage in the native format
	 * (but serialized to JSON)
	 *
	 * dataBackup: Object
	 */
	importMyFormat(dataBackup) {
		// Restore the ImmutableRect objects
		dataBackup.items.forEach((item, itemId) => {
			if (item) {
				item.rect = Rect.fromObject(item.rect);
			}
		});

		setData(immutable.fromJS(dataBackup));
	},

	exportMyFormat() {
		return data.toJS();
	},

	/**
	 * Imports a file from the external data format
	 *
	 * obj: An object in the external data format
	 */
	importFile(obj) {
		var items = [];
		var outputToConnector = {};
		var inputToConnector = {};

		// Filters import
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

		// Pipes import
		obj.pipes.forEach(pipe => {
			var id = items.length;

			// Calculate rect if necessary
			var rect;
			if (pipe.rect) {
				rect = Rect.fromObject(pipe.rect);
			} else {
				rect = WorkbenchLayout.getPipeFrame(200, 200, pipe.type, numMappings, numMappings);
			}

			// For split/join pipes we need the exact number of inputs/outputs
			var numInputs = pipe.numInputs || pipe.mappings.length;
			var numOutputs = pipe.numOutputs || pipe.mappings.length;

			items[id] = {
				type: Constants.ITEM_TYPE_PIPE,
				class: pipe.type,
				parameter: pipe.parameter[0] || {},
				inputs: new Array(numInputs),
				outputs: new Array(numOutputs),
				rect
			};

			// Read minInputs, minOutputs
			if (pipe.minInputs !== undefined) {
				items[id].minInputs = pipe.minInputs;
			}
			if (pipe.minOutputs !== undefined) {
				items[id].minOutputs = pipe.minOutputs;
			}

			// variableInputs, variableOutputs
			if (pipe.variableInputs !== undefined) {
				items[id].variableInputs = pipe.variableInputs;
			}
			if (pipe.variableOutputs !== undefined) {
				items[id].variableOutputs = pipe.variableOutputs;
			}

			// Create connections out of the mappings
			pipe.mappings.forEach((mapping, connectorId) => {
				if (!mapping) {
					return;
				}

				var filterOut = outputToConnector[mapping.output];
				var pipeIn    = [id, 0, connectorId];
				var pipeOut   = [id, 1, connectorId];
				var filterIn  = inputToConnector[mapping.input];

				// First connection (doubly linked)
				// Check bounds of pipe
				if (pipeIn[2] < items[pipeIn[0]].inputs.length) {
					// Check for duplicate connection
					if (items[filterOut[0]].outputs[filterOut[2]]) {
						console.warn('You tried to connect an input/output twice.');
					} else {
						items[filterOut[0]].outputs[filterOut[2]] = pipeIn;
						items[pipeIn[0]].inputs[pipeIn[2]] = filterOut;
					}
				}

				// Second connection (doubly linked)
				// Check bounds of pipe
				if (pipeOut[2] < items[pipeOut[0]].outputs.length) {
					// Check for duplicate connection
					if (items[filterIn[0]].inputs[filterIn[2]]) {
						console.warn('You tried to connect an input/output twice.');
					} else {
						items[pipeOut[0]].outputs[pipeOut[2]] = filterIn;
						items[filterIn[0]].inputs[filterIn[2]] = pipeOut;
					}
				}
			});
		});

		setData(data.updateIn(['items'], _ => immutable.fromJS(items)));
	}

});




// Register for all actions with the dispatcher
WorkbenchStore.dispatchToken = Dispatcher.register(function(action) {
	switch(action.actionType) {

		/**
		 * When a file object should be imported into the Store
		 */
		case Constants.IMPORT_FILE:
			// In case somebody is subscribed to WorkbenchStore and SelectionStore
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// Since we're resetting the ID namespace, we have to clear the cache
			connectorOffsets = {};

			// Load data
			WorkbenchStore.importFile(action.obj);
		break;

		/**
		 * When a new item was dragged from the RepositoryPane onto the Workbench
		 */
		case Constants.CREATE_ITEM:
			if (action.type === Constants.ITEM_TYPE_FILTER) {
				addFilter(action.id, action.position);
			} else if (action.type === Constants.ITEM_TYPE_PIPE) {
				addPipe(action.id, action.position);
			} else {
				throw new Error('Invalid item type');
			}
		break;

		/**
		 * When the number of inputs or outputs of a pipe was changed in the
		 * inspector.
		 */
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

			// Only continue if there are actually some changes outstanding
			if (deltaInputs === 0 && deltaOutputs === 0) {
				break;
			}

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

				// Update frame
				data.updateIn(['items', action.id], item => {
					var rect = item.get('rect');
					var name = item.get('class');
					var inputs = item.get('inputs').length;
					var outputs = item.get('outputs').length;
					return item.set('rect', WorkbenchLayout.getPipeFrame(rect.x, rect.y, name, inputs, outputs));
				});

			}));

			// TODO: redraw wires

			// Reset connector offset cache
			connectorOffsets = {};

			// TODO: rename this to something more appropriate
			WorkbenchStore.emitParamChange();
		break;

		/**
		 * When an item's parameters should be updated because of an edit from the inspector
		 */
		case Constants.SET_ITEM_PARAMS:
			var id = action.id;
			var params = action.params;
			setData(data.updateIn(['items', id, 'parameter'], params => params.merge(action.params)));
			WorkbenchStore.emitParamChange();
		break;

		/**
		 * When an item's param should be removed because of a delete action from the inspector
		 */
		case Constants.REMOVE_ITEM_PARAM:
			setData(data.updateIn(['items', action.id, 'parameter'], params => params.remove(action.param)));
			WorkbenchStore.emitParamChange();
		break;

		/**
		 * When a drag and drop move has been completed. Commits the change.
		 */
		case Constants.MOVE_SELECTED_ITEMS_BY:
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta).clipNegative());
				});
			}));
		break;

		/**
		 * Deletes all selected items
		 */
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

		/**
		 * Creates a blank canvas
		 */
		case Constants.DELETE_ALL_ITEMS:
			// In case somebody is subscribed to WorkbenchStore and SelectionStore
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			setData(data.updateIn(['items'], items => items.clear()));
			// Since we're resetting the ID namespace, we have to clear the cache
			connectorOffsets = {};
		break;

		/**
		 * When a connection has been succesfully dragged onto a connector
		 */
		case Constants.FINISH_CONNECTION:
			addConnection(action.from, action.to);
		break;

		/**
		 * Deletes a connection
		 */
		case Constants.DELETE_CONNECTION:
			var c1 = action.connector1;
			var c2 = action.connector2;
			setData(data.withMutations(data => {
				data.updateIn(['items', c1.get(0), (c1.get(1) ? 'outputs' : 'inputs'), c1.get(2)], () => undefined);
				data.updateIn(['items', c2.get(0), (c2.get(1) ? 'outputs' : 'inputs'), c2.get(2)], () => undefined);
			}));
		break;

		/**
		 * Undo the last change to the data object
		 */
		case Constants.UNDO:
			undo();

			connectorOffsets = {};

			// Wait for the SelectionStore to update before emitting an event,
			// because it is possible that a selected item was removed.
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// It's possible that one of the parameters changed
			WorkbenchStore.emitParamChange();
		break;

		/**
		 * Redo the last undone change of the data object
		 */
		case Constants.REDO:
			redo();

			connectorOffsets = {};

			// Wait for the SelectionStore to update before emitting an event,
			// because it is possible that a selected item was removed.
			Dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			// It's possible that one of the parameters changed
			WorkbenchStore.emitParamChange();
		break;

		/**
		 * When the left mouse button is pressed on top of a selected item
		 */
		case Constants.START_MOVING_SELECTED_ITEMS:
			isDragging = true;
			startMousePos = action.mousePos;
		break;

		/**
		 * When the mouse was moved while moving items
		 */
		case Constants.MOVING_SELECTED_ITEMS:
			var delta = action.mousePos.subtract(startMousePos);
			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']).moveBy(delta);
			}).toMap();
			WorkbenchStore.emitPreliminaryPosition();
		break;

		/**
		 * When the left mouse button was released while moving items
		 */
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
CreateConnectionStore = require('./CreateConnectionStore');




function arraysEqual(a, b) {
  if (a === b) {
  	return true;
  }
  if (a.length !== b.length) {
  	return false;
  }

  for (var i = 0; i < a.length; ++i) {
    if (a[i] !== b[i]) {
    	return false;
    }
  }
  return true;
}

/**
 * Adds a new filter to the store
 *
 * name: Name of the filter
 * position: Position where the filter should be created
 * parameter (optional)
 */
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

/**
 * Adds a new pipe to the store
 *
 * name: Name of the pipe
 * position: Position where the pipe should be created
 * parameter (optional)
 */
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

/**
 * Adds a new connection between two connectors of a pipe and a filter to the store
 *
 * input: a connector address
 * output: a connector address
 */
function addConnection(output, input) {
	// If they arrive in reverse order swap them
	if (!output.get(1) && input.get(1)) {
		[input, output] = [output, input];
	}

	var item1 = data.getIn(['items', output.get(0)]);
	var item2 = data.getIn(['items', input.get(0)]);

	// Check if these connectors are already occupied
	if (item1.getIn(['outputs', output.get(2)]) || item2.getIn(['inputs', input.get(2)])) {
		throw new Error('The connector is already connected');
	}

	// Check if the filters would be compatible
	// TODO: do this before sending the action?
	if (item1.get('type') === Constants.ITEM_TYPE_PIPE) {
		// The output connector belongs to a pipe
		var pipe = item1;
		var pipeIndex = output.get(2);
		// Let's see what's at the other end of the pipe
		var connectedTo = pipe.getIn(['inputs', pipeIndex]) || pipe.get('inputs').last();
		if (connectedTo) {
			var fromFilter = data.getIn(['items', connectedTo.get(0), 'class']);
			var fromFilterIndex = connectedTo.get(2);
			var toFilter = data.getIn(['items', input.get(0), 'class']);
			var toFilterIndex = input.get(2);
		}
	} else {
		// The input connector belongs to a pipe
		var pipe = item2;
		var pipeIndex = input.get(2);
		// Let's see what's at the other end of the pipe
		var connectedTo = pipe.getIn(['outputs', pipeIndex]) || pipe.get('outputs').last();
		if (connectedTo) {
			var fromFilter = data.getIn(['items', output.get(0), 'class']);
			var fromFilterIndex = output.get(2);
			var toFilter = data.getIn(['items', connectedTo.get(0), 'class']);
			var toFilterIndex = connectedTo.get(2);
		}
	}

	if (fromFilter && toFilter && !FilterCompatibility.test(fromFilter, fromFilterIndex, toFilter, toFilterIndex)) {
		// Dispatcher.waitFor([ CreateConnectionStore.dispatchToken ]);
		alert(translate('errors.incompatible_filters', { fromFilter, toFilter }));
		return;
	}

	// Make the connection come true
	setData(data.withMutations(data => {
		data.updateIn(['items', output.get(0), 'outputs', output.get(2)], () => Vector.from(input));
		data.updateIn(['items', input.get(0), 'inputs', input.get(2)], () => Vector.from(output));
	}));
}

/**
 * Finds connected pairs of input/output on opposing sides of an item
 */
function getConnectedPairs(pipe) {
	var inputs = pipe.get('inputs');
	var outputs = pipe.get('outputs');

	var connectors = Math.max(inputs.length, outputs.length);
	var pairs = [];
	for (var i = 0; i < connectors; ++i) {
		var input = inputs.get(i) || inputs.last();
		var output = outputs.get(i) || outputs.last();
		if (!input || !output) { continue; }
		pairs.push(Vector(input, output));
	}
	return Vector.from(pairs);
}

/**
 * Tests all connection pairs for compatibility and returns
 * true if that is the case
 */
function testFilterCompatibility() {
	return data.get('items')
		.filter(i => i && i.get('type') === Constants.ITEM_TYPE_PIPE) // get only pipes
		.flatMap(pipe => getConnectedPairs(pipe)) // get the connections between filters
		.filter(pair => { // test the connections for compatibility and keep a list of the incompatible ones
			var fromFilter = data.getIn(['items', pair.getIn([0, 0]), 'class']);
			var toFilter = data.getIn(['items', pair.getIn([1, 0]), 'class']);
			return !FilterCompatibility.test(fromFilter, pair.getIn([0, 2]), toFilter, pair.getIn([1, 2]));
		})
		.cacheResult()
		.length === 0;
}