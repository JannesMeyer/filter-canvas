#!/usr/bin/env node
'use strict';

var WebpackDevServer = require('webpack-dev-server');
var webpack = require('webpack');
var config = require('./webpack.config');

new WebpackDevServer(webpack(config), {
	// dev server options
	contentBase: './public',
	hot: true,
	// dev middleware options
	watchDelay: 50,
	publicPath: config.output.publicPath,
	stats: { colors: true }
})
.listen(3000, function() {
	console.log('Server started: http://localhost:3000/');
});