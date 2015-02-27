#!/usr/bin/env node

var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

// Start dev server
new WebpackDevServer(webpack(config), {
	// [webpack dev server](http://webpack.github.io/docs/webpack-dev-server.html)
	contentBase: './public',
	hot: true,

	// [webpack dev middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
	watchDelay: 50,
	stats: {
		colors: true
	}
}).listen(3000, function() {
	console.log('Starting server on port 3000...');
});