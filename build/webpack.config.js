const path = require('path');
const webpack = require('webpack');
const HtmlwebpackPlugin = require('html-webpack-plugin');

const PRODUCTION    = process.env.NODE_ENV === 'production' ? true : false,
	  COMPRESSION   = process.env.WEBPACK_TEMPLATE_COMPRESS === 'true' ? true : false,
	  TEMPLATE_TYPE = process.env.WEBPACK_TEMPLATE_TYPE,
	  LIB_MODE		= process.env.WEBPACK_TEMPLATE_TYPE === 'lib' ? true : false;
const PACKAGE = require('../package.json');
const ROOT_DIR = path.resolve(__dirname, '../');

console.log(PRODUCTION?'___PRODUCTION___':'___DEVELOPMENT___');
console.log(`WEBPACK_TEMPLATE_TYPE: ${process.env.WEBPACK_TEMPLATE_TYPE}`);

module.exports = {

	entry: (function(){
		const _entry_ = { main: './src/main.js' };
		if (!LIB_MODE && PRODUCTION)
			_entry_.vendor = ['mithril', 'normalize.css'];
		return _entry_;
	})(),

	output: (function(){

		const _output_ = {
			path: path.resolve(ROOT_DIR, `dist/${TEMPLATE_TYPE}/`)
		};

		if (LIB_MODE) {
			_output_.filename = `${PACKAGE.config.full_name}${COMPRESSION?'.min':''}.js`;
			if (PRODUCTION) {
				_output_.library = PACKAGE.config.module_name;
				_output_.libraryTarget = 'umd';
				_output_.umdNamedDefine = true;
			}
		} else {
			_output_.filename = '[name].bundle.js';
			_output_.chunkFilename = '[id].chunk.js';
		}

		return _output_;
	})(),

	devtool: PRODUCTION ? false : 'source-map',

	module: {
		rules: [

			{
				test: /\.jsx?$/,
				loader: 'babel-loader',
				exclude: /node_modules/
			},

			{
				test: /\.hbs$/,
				loader: 'handlebars-loader'
			},

			{
				test: /\.(css|sass|scss)$/,
				use: [
					{
						loader: 'style-loader',
						options: {sourceMap: !PRODUCTION}
					},
					{
						loader: 'css-loader',
						options: {
							sourceMap: !PRODUCTION,
							modules: true,
							localIdentName: '[name]__[local]___[hash:base64:5]',
							minimize: PRODUCTION,
							importLoaders: 1
						}
					},
					{
						loader: 'postcss-loader',
						options: {
							sourceMap: !PRODUCTION,
							plugins: (loader) => [
								require('postcss-cssnext')({
									browsers: ['last 2 versions', 'ie 10']
								}) // includes autoprefixer
							]
						}
					},
					{
						loader: 'sass-loader',
						options: {sourceMap: !PRODUCTION}
					}
				]
			},

			{
				test: /\.(jpe?g|png|svg)$/,
				loader: 'url-loader',
				options: {
					limit: 5000,
					name: '[path][name].[hash].[ext]',
					useRelativePath: PRODUCTION
				}
			},

			{
				test: /\.(mp3|mp4)$/,
				loader: 'file-loader',
				options: {
					name: '[path][name].[hash].[ext]',
					useRelativePath: PRODUCTION
				},
			}
		]
	},

	resolve: {
		alias: {
			Assets: path.resolve(ROOT_DIR, 'src/assets/'),
			Comps: path.resolve(ROOT_DIR, 'src/components/'),
			Data: path.resolve(ROOT_DIR, 'src/data/'),
			Models: path.resolve(ROOT_DIR, 'src/models/'),
			Services: path.resolve(ROOT_DIR, 'src/services/'),
			Utils: path.resolve(ROOT_DIR, 'src/utils/'),
			Views: path.resolve(ROOT_DIR, 'src/views/')
		},
		extensions: ['.js', '.jsx', '.json']
	},

	plugins: (function(){
		const plugins = [];

		if (!LIB_MODE) {
			plugins.push( new webpack.ProvidePlugin({m:'mithril'}) );
		}

		if (!PRODUCTION || COMPRESSION) {
			plugins.push(
				new HtmlwebpackPlugin({
					title: PACKAGE.name,
					src: PACKAGE.config.full_name,
					template: `template/index-${TEMPLATE_TYPE}.hbs`,
					minify: PRODUCTION ? {
						collapseWhitespace: true,
						caseSensitive: true,
						removeComments: true
					} : false
				})
			);
		}

		if (PRODUCTION) {
			if (!LIB_MODE) {
				plugins.push(
					new webpack.optimize.CommonsChunkPlugin({
						name: 'vendor',
						filename: 'vendor.bundle.js'
					})
				);
			}
			if (COMPRESSION) {
				plugins.push(
					new webpack.optimize.UglifyJsPlugin({
						mangle: {
							props: { regex: /_$/ }
						},
						sourcemap: false
					})
				);
			}
			plugins.push(
				new webpack.BannerPlugin({
					banner: `${PACKAGE.config.full_name}.js v${PACKAGE.version} | (c) ${PACKAGE.config.year_launched}-2017 ${PACKAGE.author} | ${PACKAGE.license} License`,
					entryOnly: true
				})
			);
		}

		return plugins;
	})(),

	devServer: {
		// hot: true,
		// compress: true,
		contentBase: path.resolve(ROOT_DIR, `dist/${TEMPLATE_TYPE}`),
		publicPath: '/',
		host: PACKAGE.config.dev_host,
		port: parseInt(PACKAGE.config.dev_port),
		allowedHosts: [
			'.designbycy.com',
			'.nationalgeographic.com'
		]
	}
};
