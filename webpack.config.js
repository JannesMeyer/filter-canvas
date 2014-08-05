'use strict';
var webpack = require('webpack');
var path = require('path');
var getPath = path.join.bind(path, __dirname);

var paths = {
	main: getPath(),
	modules: getPath('node_modules'),
	javascripts: getPath('public', 'javascripts'),
	stylesheets: getPath('public', 'stylesheets')
};

function BellOnErrorPlugin() {
}
BellOnErrorPlugin.prototype.apply = function(compiler) {
	compiler.plugin('done', function(stats) {
		console.log('done');
		// if (stats.hasErrors()) {
		// 	// System bell character
		// 	console.log('Error\u0007');
		// }
	});
};

var config = {
	cache: true,
	entry: [
		'webpack/hot/dev-server',
		getPath('src', 'main.js'),
	],
	output: {
		path: paths.javascripts,
		filename: '[name].bundle.js',
		publicPath: '/javascripts/'
	},
	watchDelay: 50,
	plugins: [
		new webpack.HotModuleReplacementPlugin(),
		new webpack.ProvidePlugin({
			'React': 'react',
			'Fluxxor': 'fluxxor',
			'Immutable': 'immutable'
		}),
		new BellOnErrorPlugin()
	],
	module: {
		loaders: [
			{
				test: /\.jsx$/,
				loaders: ['react-hot-loader', 'jsx-loader?harmony&insertPragma=React.DOM'],
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.js$/,
				loader: 'jsx-loader?harmony',
				include: [ paths.main ],
				exclude: [ paths.modules ]
			},
			{
				test: /\.css$/,
				loaders: ['style-loader', 'css-loader']
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