'use strict';

/**
 * Webpack plugin that triggers the system bell everytime there's an error
 * after a build completes. This helps you recognize errors even when the
 * terminal window is in the background.
 */
function ErrorBellPlugin() {
}

ErrorBellPlugin.prototype.apply = function(compiler) {
	compiler.plugin('done', function(stats) {
		if (stats.hasErrors()) {
			// System bell character
			console.log('\u0007');
		}
	});
};

module.exports = ErrorBellPlugin;