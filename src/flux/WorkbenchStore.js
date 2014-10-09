var immutable = require('immutable');
var { Map, Vector } = immutable;
var Point = require('../lib/ImmutablePoint');
var merge = require('react/lib/merge');
var WorkbenchLayout = require('../interface/WorkbenchLayout');

var BaseStore = require('../lib/BaseStore');
var RepositoryStore; // late import
var SelectionStore; // late import
var dispatcher = require('./dispatcher');
var constants = require('./constants');

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
		return data.get('items');
	},

	/**
	 * returns an immutable.Map
	 */
	getItem(id) {
		return data.getIn(['items', id]);
	},

	/**
	 * returns an immutable.Set
	 */
	getItemsCoveredBy(rect) {
		return data.get('items')
			.toMap()
			.filter(f => rect.intersectsRect(f.get('rect')))
			.keySeq()
			.toSet();
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
				// Preserve the original index, because after filtering out some
				// elements, the remaining element's indexes will have changed
				item.itemId = index;
				return item.type === constants.ITEM_TYPE_FILTER;
			})
			.map((filter, index) => {
				filterIndexes[filter.itemId] = index;
				return {
	        filterID: filter.itemId,
	        class: filter.class,
	        parameter: [ filter.parameter ],
	        inputs: filter.inputs.map(cTo => ({ inputID: inputCounter++, type: null })), // TODO: type
	        outputs: filter.outputs.map(cTo => ({ outputID: outputCounter++, type: null }))
				};
			});

		obj.pipes = items
			.filter((item, index) => {
				// Preserve the original index, because after filtering out some
				// elements, the remaining element's indexes will have changed
				item.itemId = index;
				return item.type === constants.ITEM_TYPE_PIPE;
			})
			.map((pipe, index) => {
				var mappings = [];
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
					pipeID: pipe.itemId,
					type: pipe.class,
					parameter: [ pipe.parameter ],
					mappings
				};
			});

		return obj;
	}

});

WorkbenchStore.dispatchToken = dispatcher.register(function(action) {
	switch(action.actionType) {

		case constants.IMPORT_FILE:
			importFile(action.obj);
		break;

		case constants.CREATE_ITEM:
			if (action.type === constants.ITEM_TYPE_FILTER) {
				addFilter(action.id, action.position);
			} else if (action.type === constants.ITEM_TYPE_PIPE) {
				addPipe(action.id, action.position);
			} else {
				throw new Error('Invalid item type');
			}
		break;

		case constants.SET_ITEM_PARAMS:
			setData(data.updateIn(['items', action.id, 'parameter'], params => params.merge(action.params)));
			WorkbenchStore.emitParamChange();
		break;

		case constants.REMOVE_ITEM_PARAM:
			setData(data.updateIn(['items', action.id, 'parameter'], params => params.remove(action.param)));
			WorkbenchStore.emitParamChange();
		break;

		case constants.MOVE_SELECTED_ITEMS_BY:
			setData(data.withMutations(data => {
				action.selectedItems.forEach((_, id) => {
					data.updateIn(['items', id, 'rect'], rect => rect.moveBy(action.delta));
				});
			}));
		break;

		case constants.DELETE_SELECTED_ITEMS:
			// TODO: Why is this necessary? It's probably because of the DetailPane
			dispatcher.waitFor([ SelectionStore.dispatchToken ]);

			var deleteItems = action.selectedItems;
			if (deleteItems.length === 0) {
				break;
			}

			// TODO: deleting items leads to a sparse array
			// TODO: should old IDs be reused?
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

		case constants.DELETE_ALL_ITEMS:
			setData(data.updateIn(['items'], items => items.clear()));
			// Clear all the rest
			connectorOffsets = {};
		break;

		case constants.FINISH_CONNECTION:
			addConnection(action.from, action.to);
		break;

		case constants.DELETE_CONNECTION:
			var c1 = action.connector1;
			var c2 = action.connector2;
			setData(data.withMutations(data => {
				data.updateIn(['items', c1.get(0), (c1.get(1) ? 'outputs' : 'inputs'), c1.get(2)], () => undefined);
				data.updateIn(['items', c2.get(0), (c2.get(1) ? 'outputs' : 'inputs'), c2.get(2)], () => undefined);
			}));
		break;

		case constants.UNDO:
			undo();
		break;

		case constants.REDO:
			redo();
		break;

		case constants.START_MOVING_SELECTED_ITEMS:
			isDragging = true;
			startMousePos = action.mousePos;
			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']);
			}).toMap();
		break;

		case constants.MOVING_SELECTED_ITEMS:
			var delta = action.mousePos.subtract(startMousePos);

			itemPositions = SelectionStore.getSelectedItemIds().map(id => {
				return data.getIn(['items', id, 'rect']).moveBy(delta);
			}).toMap();

			WorkbenchStore.emitPreliminaryPosition();
		break;

		case constants.FINISH_MOVING_SELECTED_ITEMS:
			isDragging = false;
			itemPositions = itemPositions.clear();
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
	var outputIDToConnector = {};
	var inputIDToConnector = {};

	// TODO: check for position and use it if available
	obj.filters.forEach(filter => {
		var id = items.length;
		var name = filter.class;
		var inputs = filter.inputs.length;
		var outputs = filter.outputs.length;

		items[id] = {
			type: constants.ITEM_TYPE_FILTER,
			class: name,
			parameter: filter.parameter[0] || {},
			inputs: new Array(filter.inputs.length),
			outputs: new Array(filter.outputs.length),
			rect: WorkbenchLayout.getFilterFrame(100, 100, name, inputs, outputs)
		};

		filter.inputs.forEach((input, connectorId) => {
			inputIDToConnector[input.inputID] = [id, 0, connectorId];
		});
		filter.outputs.forEach((output, connectorId) => {
			outputIDToConnector[output.outputID] = [id, 1, connectorId];
		});
	});

	obj.pipes.forEach(pipe => {
		var id = items.length;
		var name = pipe.type;
		var inputs = pipe.mappings.length; // TODO: TO BE DETERMINED for split/join pipes
		var outputs = pipe.mappings.length; // TODO: TO BE DETERMINED for split/join pipes

		items[id] = {
			type: constants.ITEM_TYPE_PIPE,
			class: name,
			parameter: pipe.parameter[0] || {},
			inputs: new Array(inputs),
			outputs: new Array(outputs),
			rect: WorkbenchLayout.getPipeFrame(200, 200, name, inputs, outputs)
		};

		pipe.mappings.forEach((mapping, connectorId) => {
			var filterOut = outputIDToConnector[mapping.output];
			var pipeIn    = [id, 0, connectorId];
			var pipeOut   = [id, 1, connectorId];
			var filterIn  = inputIDToConnector[mapping.input];

			// Check for double connection
			var p1 = items[filterOut[0]].outputs[filterOut[2]];
			var p2 = items[filterIn[0]].inputs[filterIn[2]];
			if (p1 || p2) {
				throw new Error('already has a connection. handle split/join pipes');
			}

			items[filterOut[0]].outputs[filterOut[2]] = pipeIn;
			items[pipeIn[0]].inputs[pipeIn[2]] = filterOut;

			items[pipeOut[0]].outputs[pipeOut[2]] = filterIn;
			items[filterIn[0]].inputs[filterIn[2]] = pipeOut;
		});
	});

	// Load data into the store
	setData(data.updateIn(['items'], _ => immutable.fromJS(items)));
	// Clear all the rest
	connectorOffsets = {};
}

function addFilter(name, pos, params) {
	var baseFilter = RepositoryStore.getFilter(name);
	if (!baseFilter) {
		throw new Error('The filter class doesn\'t exist');
	}

	var inputs = baseFilter.inputs;
	var outputs = baseFilter.outputs;
	var parameter = merge(baseFilter.parameter, params);

	var item = Map({
		type: constants.ITEM_TYPE_FILTER,
		class: name,
		inputs: Vector.from(new Array(inputs)),
		outputs: Vector.from(new Array(outputs)),
		parameter: Map(parameter),
		rect: WorkbenchLayout.getFilterFrame(pos.x, pos.y, name, inputs, outputs)
	});
	setData(data.updateIn(['items'], items => items.push(item)));
}

function addPipe(name, pos, params) {
	var basePipe = RepositoryStore.getPipe(name);
	if (!basePipe) {
		throw new Error('The pipe class doesn\'t exist');
	}
	var inputs = basePipe.inputs || 0;
	var outputs = basePipe.outputs || 0;
	var parameter = merge(basePipe.parameter, params);
	// JoinPipe
	if (parameter.inputs !== undefined) {
		inputs += parameter.inputs;
	}
	// SplitPipe
	if (parameter.outputs !== undefined) {
		outputs += parameter.outputs;
	}
	// ForwardPipe
	if (parameter.cardinality !== undefined) {
		inputs += parameter.cardinality;
		outputs += parameter.cardinality;
	}

	var item = Map({
		type: constants.ITEM_TYPE_PIPE,
		class: name,
		// inputs: immutable.Range(0, inputs).map(val => null).toVector(),
		inputs: Vector.from(new Array(inputs)),
		outputs: Vector.from(new Array(outputs)),
		parameter: Map(parameter),
		rect: WorkbenchLayout.getPipeFrame(pos.x, pos.y, name, inputs, outputs)
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

importFile(JSON.parse('{"factoryVersion":"0.2","filters":[{"filterID":0,"class":"SourceFilterExample","parameter":[{"waitMax":500000,"waitMin":10}],"inputs":[],"outputs":[{"outputID":1,"type":null}]},{"filterID":2,"class":"EndFilter","parameter":[{}],"inputs":[{"inputID":1,"type":null},{"inputID":2,"type":null},{"inputID":3,"type":null}],"outputs":[]},{"filterID":5,"class":"WorkFilterExample","parameter":[{"waitMax":500000,"waitMin":10}],"inputs":[{"inputID":4,"type":null}],"outputs":[{"outputID":2,"type":null}]},{"filterID":9,"class":"SourceFilterExample","parameter":[{"waitMax":500000,"waitMin":10}],"inputs":[],"outputs":[{"outputID":3,"type":null}]},{"filterID":10,"class":"SourceFilterExample","parameter":[{"waitMax":500000,"waitMin":10}],"inputs":[],"outputs":[{"outputID":4,"type":null}]}],"pipes":[{"pipeID":0,"type":"ForwardPipe","parameter":[{"cardinality":3,"sync":true}],"mappings":[{"inFilter":0,"output":1,"outFilter":2,"input":1},{"inFilter":9,"output":3,"outFilter":2,"input":2},{"inFilter":10,"output":4,"outFilter":5,"input":4}]},{"pipeID":1,"type":"ForwardPipe","parameter":[{"cardinality":1,"sync":true}],"mappings":[{"inFilter":5,"output":2,"outFilter":2,"input":3}]}]}'));