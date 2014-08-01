'use strict';

var webpack = require('webpack');
var path = require('path');

function resolve(dir) {
	return path.join(__dirname, dir);
}

module.exports = {
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
		}),
		// new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
		// new webpack.optimize.UglifyJsPlugin()
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