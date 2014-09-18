'use strict';

var webpack = require('webpack');
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
	entry: [ paths.entryScript ],
	output: {
		path: paths.publicScripts,
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	watchDelay: 50,
	plugins: [
		new webpack.ProvidePlugin({
			'React': 'react'
		})
	],
	module: {
		loaders: [
			{
				test: /\.react\.js$/,
				loaders: ['strict-loader', 'jsx-loader?harmony&insertPragma=React.DOM'],
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
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	var options = {
		// Regex that never matches
		comments: / ^/,
		mangle: {
			sort: true
		},
		compress: {
			drop_console: true,
			hoist_vars: true,
			warnings: false
		}
	};
	config.plugins.push(new webpack.optimize.UglifyJsPlugin(options));
} else {
	// Hot module replacement in development
	config.entry.unshift('webpack/hot/dev-server');
	config.plugins.push(new webpack.HotModuleReplacementPlugin());
	config.module.loaders[0].loaders.unshift('react-hot-loader');
}

module.exports = config;