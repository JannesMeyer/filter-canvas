var webpack = require('webpack');
var path = require('path');
var getAbsolutePath = path.join.bind(path, __dirname);

var config = {
	entry: [ './src/main.js' ],
	output: {
		path: getAbsolutePath('build'),
		filename: '[name].bundle.js'
	},
	cache: true,
	watchDelay: 50,
	module: {
		loaders: [
			{
				test: /\.js$/,
				loaders: [ 'babel' ],
				include: [ getAbsolutePath('src') ]
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
	config.plugins = [
		new webpack.DefinePlugin({ 'process.env.NODE_ENV': '"production"' }),
		new webpack.optimize.OccurenceOrderPlugin(),
		new webpack.optimize.UglifyJsPlugin({
			comments: / ^/,
			compress: { warnings: false }
		})
	];
} else {
	// Hot module replacement
	config.entry.unshift('webpack/hot/dev-server');
	config.plugins = [ new webpack.HotModuleReplacementPlugin() ];
	// config.plugins.push(new webpack.NoErrorsPlugin());
	config.module.loaders[0].loaders.unshift('react-hot');
}

module.exports = config;