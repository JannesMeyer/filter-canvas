import React from 'react';
import Perf from 'react/lib/ReactDefaultPerf';
import App from './components/App.react';
import translate from 'counterpart';
import 'babel-core/polyfill';

// Webpack
import '../public/index.html';
import './config.js';
import 'normalize.css/normalize.css';
import '../stylus/main.styl';

var locales = ['en', 'de', 'es'];
var isDev = (process.env.NODE_ENV !== 'production');

// Register translations
for (var locale of locales) {
	translate.registerTranslations(locale, require('./locales/' + locale));
}

// Select language
if (navigator.languages) {
	for (var lang of navigator.languages) {
		lang = lang.split('-')[0];
		if (locales.includes(lang)) {
			translate.setLocale(lang);
			break;
		}
	}
}

// Measure performance
if (isDev) {
	window.printWasted = Perf.printWasted;
	window.printInclusive = Perf.printInclusive;
	Perf.start();
}

// Render the controller-view
React.render(<App locale={translate.getLocale()} />, document.body);
translate.onLocaleChange(() => {
	React.render(<App locale={translate.getLocale()} />, document.body);
});