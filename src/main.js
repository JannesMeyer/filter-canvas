import 'babel-core/polyfill';
import React from 'react';
import Perf from 'react/lib/ReactDefaultPerf';
import App from './components/App.react';
import cfg from './config';

// Webpack
import '../public/index.html';
import 'normalize.css/normalize.css';
import '../stylus/main.styl';

// Measure performance in development mode
if (cfg.DEV) {
	window.printWasted = Perf.printWasted;
	window.printInclusive = Perf.printInclusive;
	Perf.start();
}

React.render(<App />, document.body);