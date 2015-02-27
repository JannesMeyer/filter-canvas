// Webpack: Copy public files
require('../public/index.html');

// Webpack: Import configuration file
require('../filter-canvas.config.js');

// Webpack: Import CSS
require('normalize.css/normalize.css');
require('../stylus/main.styl');

import App from './components/App.react';

// Render controller view
React.render(<App />, document.body);

// Measure performance for debugging
var isBrowser = (typeof window !== 'undefined');
var isDev = (process.env.NODE_ENV !== 'production');
if (isBrowser && isDev) {
	window.Perf = require('react/lib/ReactDefaultPerf');
	window.printWasted = window.Perf.printWasted;
	window.printInclusive = window.Perf.printInclusive;
	window.Perf.start();
}