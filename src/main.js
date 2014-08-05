'use strict';
require('main.css'); // webpack
var Workbench = require('./components/workbench');
var stores = require('./stores');
var actions = require('./actions');

var flux = new Fluxxor.Flux(stores, actions);
React.renderComponent(Workbench({ flux }), document.body);