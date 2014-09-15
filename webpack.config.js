'use strict';

var webpack = require('webpack');
var ErrorNotificationPlugin = require('./WebpackErrorNotificationPlugin');
var path = require('path');
var getAbsolutePath = path.join.bind(path, __dirname);

var paths = {
	main: getAbsolutePath(),
	modules: getAbsolutePath('node_modules'),
	entryScript: getAbsolutePath('src', 'main.js'),
	publicScripts: getAbsolutePath('public', 'javascripts')
};

var config = {
	cache: true,
	entry: [
		'webpack/hot/dev-server',
		paths.entryScript
	],
	output: {
		path: paths.publicScripts,
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	watchDelay: 50,
	plugins: [
		new webpack.ProvidePlugin({
			'React': 'react'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new ErrorNotificationPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.react\.js$/,
				loaders: ['react-hot-loader', 'strict-loader', 'jsx-loader?harmony&insertPragma=React.DOM'],
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.js$/,
				loaders: ['strict-loader', 'jsx-loader?harmony'],
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.css$/,
				loaders: ['style-loader', 'css-loader']
			},
			{
				test: /\.styl$/,
				loaders: ['style-loader', 'css-loader', 'stylus-loader']
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json']
	}
};

if ('production' === process.env.NODE_ENV) {
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
	config.plugins.push(new webpack.optimize.DedupePlugin());
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	// config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;