#!/usr/bin/env node
var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
	// [webpack dev server](http://webpack.github.io/docs/webpack-dev-server.html)
	contentBase: './public',
	hot: true,

	// [webpack dev middleware](http://webpack.github.io/docs/webpack-dev-middleware.html)
	stats: { colors: true }
}).listen(9000, function() {
	console.log('Starting server on port 9000...');
});