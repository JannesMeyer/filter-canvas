'use strict';

var webpack = require('webpack');
var path = require('path');

var getPath = path.join.bind(path, __dirname);
var config = {
	cache: true,
	entry: [
		'webpack/hot/dev-server',
		getPath('src', 'main.js'),
	],
	output: {
		path: getPath('public', 'javascripts'),
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin({
			'React': 'react',
			'Fluxxor': 'fluxxor',
			'Immutable': 'immutable'
		})
	],
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loaders: [
					'react-hot',
					'jsx?harmony&insertPragma=React.DOM'
				],
				include: [ getPath() ],
				exclude: [ getPath('node_modules') ]
			},
			{
				test: /\.js$/,
				loader: 'jsx?harmony',
				include: [ getPath() ],
				exclude: [ getPath('node_modules') ]
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx']
	}
};

if ('production' === process.env.NODE_ENV) {
	// config.plugins.push(new webpack.optimize.DedupePlugin());
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
	config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;