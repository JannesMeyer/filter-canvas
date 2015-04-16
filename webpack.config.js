var webpack = require('webpack');
var path = require('path');
var getAbsolutePath = path.join.bind(path, __dirname);

var config = {
	entry: [ './src/main.js' ],
	output: {
		path: 'build',
		filename: '[name].bundle.js'
	},
	cache: true,
	watchDelay: 50,
	plugins: [
		new webpack.ProvidePlugin({ React: 'react', translate: 'counterpart' })
	],
	module: {
		loaders: [
			{
				test: /\.js$/,
				loaders: [ 'babel' ],
				include: [ getAbsolutePath('src') ],
				exclude: [ getAbsolutePath('node_modules') ]
			},
			{ test: /\.styl$/, loaders: [ 'style', 'css', 'autoprefixer', 'stylus' ] },
			{ test: /\.css$/, loaders: [ 'style', 'css', 'autoprefixer' ] },
			{ test: /\.(woff|eot|ttf|svg|png)($|\?)/, loader: 'file' },
			{ test: getAbsolutePath('public'), loader: 'file?name=[name].[ext]' }
		]
	},
	resolve: {
		extensions: ['', '.js', '.json']
	}
};

if (process.env.NODE_ENV === 'production') {
	// Production
	config.plugins.push(new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }));
	config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
	config.plugins.push(new webpack.optimize.UglifyJsPlugin({
		// regex never matches
		comments: / ^/,
		compress: { hoist_vars: true, warnings: false }
	}));
} else {
	// Hot module replacement
	config.entry.unshift('webpack/hot/dev-server');
	config.plugins.push(new webpack.HotModuleReplacementPlugin());
	// config.plugins.push(new webpack.NoErrorsPlugin());
	config.module.loaders[0].loaders.unshift('react-hot');
}

module.exports = config;