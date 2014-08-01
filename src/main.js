/** @jsx React.DOM */
'use strict';

var Workbench = require('./components/workbench');

var stores = require('./stores');
var actions = require('./actions');
var flux = new Fluxxor.Flux(stores, actions);

// Render the main component
React.renderComponent(<Workbench flux={flux} />, document.body);