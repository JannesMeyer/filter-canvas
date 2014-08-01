'use strict';

var webpack = require('webpack');
var path = require('path');

function resolve(dir) {
	return path.join(__dirname, dir);
}

var config = {
	cache: true,
	entry: './src/main.js',
	output: {
		path: './public/javascripts',
		filename: '[name].bundle.js',
	},
	plugins: [
		new webpack.ProvidePlugin({
			'React': 'react',
			'Fluxxor': 'fluxxor',
			'Immutable': 'immutable'
		})
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				loader: 'jsx-loader?harmony',
				exclude: [ resolve('node_modules') ]
			}
		]
	}
};

if ('production' === process.env.NODE_ENV) {
	console.log('Compiling for production...');
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"' + process.env.NODE_ENV + '"' }));
	config.plugins.push(new webpack.optimize.UglifyJsPlugin());
}

module.exports = config;