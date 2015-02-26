// Webpack: Copy public files
require('../public/index.html');

// Webpack: Copy configuration file
require('../config.js');

// Webpack: Import CSS
require('normalize.css/normalize.css');
require('../stylus/main.styl');

var App = require('./components/App.react');

// Render controller view
React.renderComponent(App(), document.body);

if (process.env.NODE_ENV !== 'production' && typeof window !== 'undefined') {
	window.immutable = require('immutable');
	window.Rect = require('./lib/ImmutableRect');
	window.Point = require('./lib/ImmutablePoint');
	window.Size = require('./lib/ImmutableSize');
	window.React = require('react');
	window.Perf = require('react/lib/ReactDefaultPerf');
	window.Perf.start();
	window.wasted = window.Perf.printWasted;
	window.inclusive = window.Perf.printInclusive;
}