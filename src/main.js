// Webpack
import '../public/index.html'; // copy
import '../filter-canvas.config.js'; // copy
import 'normalize.css/normalize.css'; // import
import '../stylus/main.styl'; // import & translate

// JavaScript modules
import App from './components/App.react';

var isBrowser = (typeof window !== 'undefined');
var isDev = (process.env.NODE_ENV !== 'production');

translate.registerTranslations('en', require('./locales/en'));
translate.registerTranslations('de', require('./locales/de'));
translate.registerTranslations('es', require('./locales/es'));

// Only if the browser supports `navigator.languages`
if (isBrowser && navigator.languages) {
	for (var locale of navigator.languages) {
		locale = locale.split('-')[0];
		if (locale === 'en' || locale === 'de' || locale === 'es') {
			translate.setLocale(locale);
			break;
		}
	}
}

// Render the controller-view
React.render(<App />, document.body);

// Re-render on locale changes
translate.onLocaleChange(() => {
	window.localeChange = true;
	React.render(<App />, document.body, () => { window.localeChange = false; });
});

// Measure performance for debugging
if (isBrowser && isDev) {
	window.Perf = require('react/lib/ReactDefaultPerf');
	window.printWasted = window.Perf.printWasted;
	window.printInclusive = window.Perf.printInclusive;
	window.Perf.start();
}