'use strict';

var webpack = require('webpack');
var ErrorNotificationPlugin = require('./WebpackErrorNotificationPlugin');
var path = require('path');
var getAbsolutePath = path.join.bind(path, __dirname);

var paths = {
	main: getAbsolutePath(),
	modules: getAbsolutePath('node_modules'),
	javascripts: getAbsolutePath('public', 'javascripts'),
	stylesheets: getAbsolutePath('public', 'stylesheets')
};

var config = {
	cache: true,
	entry: [
		'webpack/hot/dev-server',
		getAbsolutePath('src', 'main.js'),
	],
	output: {
		path: paths.javascripts,
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	watchDelay: 50,
	plugins: [
		new webpack.ProvidePlugin({
			'React': 'react',
			'Immutable': 'immutable',
			'Fluxxor': 'fluxxor'
		}),
		new webpack.HotModuleReplacementPlugin(),
		new ErrorNotificationPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loaders: ['react-hot-loader', 'strict', 'jsx?harmony&insertPragma=React.DOM'],
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.js$/,
				loaders: ['strict', 'jsx?harmony'],
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.css$/,
				loaders: ['style', 'css']
			}
		]
	},
	resolve: {
		root: paths.stylesheets,
		extensions: ['', '.js', '.jsx', '.json']
	}
};

if ('production' === process.env.NODE_ENV) {
	// config.plugins.push(new webpack.optimize.DedupePlugin());
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
	config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;