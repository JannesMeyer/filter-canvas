'use strict';

var webpack = require('webpack');
var path = require('path');

// Helper function to convert relative paths to absolute ones
var getAbsolutePath = path.join.bind(path, __dirname);

var config = {
	cache: true,
	entry: [
		getAbsolutePath('src', 'main.js')
	],
	output: {
		path: getAbsolutePath('public', 'javascripts'),
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	watchDelay: 50,
	plugins: [
		new webpack.ProvidePlugin({ 'React': 'react' })
	],
	module: {
		loaders: [
			{
				test: /\.react\.js$/,
				loaders: ['strict', 'jsx?harmony&insertPragma=React.DOM'],
				include: [ getAbsolutePath() ],
				exclude: [ getAbsolutePath('node_modules') ]
			},
			{
				test: /\.js$/,
				loaders: ['strict', 'jsx?harmony'],
				include: [ getAbsolutePath() ],
				exclude: [ getAbsolutePath('node_modules') ]
			},
			{
				test: /\.css$/,
				loaders: ['style', 'css', 'autoprefixer']
			},
			{
				test: /\.styl$/,
				loaders: ['style', 'css', 'autoprefixer', 'stylus']
			}
		]
	},
	resolve: {
		extensions: ['', '.js', '.jsx', '.json']
	}
};

// Do an optimized build for production
if ('production' === process.env.NODE_ENV) {
	var uglifyOptions = {
		// This is a regex that never matches so that all comments get deleted
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
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	config.plugins.push(new webpack.optimize.UglifyJsPlugin(uglifyOptions));
} else {
	// Hot module replacement (automatic reloading) in development
	config.entry.unshift('webpack/hot/dev-server');
	config.plugins.push(new webpack.HotModuleReplacementPlugin());
	config.module.loaders[0].loaders.unshift('react-hot');
}

module.exports = config;