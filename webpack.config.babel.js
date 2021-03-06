/* eslint-disable no-console */
//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
//import ExtractTextPlugin, {extract as extractText} from 'extract-text-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import glob from 'glob';
import globImporter from 'node-sass-glob-importer';
import path from 'path';
import {ProvidePlugin} from 'webpack';
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');


//──────────────────────────────────────────────────────────────────────────────
// Functions
//──────────────────────────────────────────────────────────────────────────────
//const toStr = v => JSON.stringify(v, null, 4);
const dict = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })));


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const JS_EXTENSION_GLOB_BRACE = '*.{es,es6,mjs,jsx,flow,js}';
const ASSETS_PATH_GLOB_BRACE = '{site/assets,assets}';

const SRC_DIR = 'src/main/resources';
const DST_DIR = 'build/resources/main';


//──────────────────────────────────────────────────────────────────────────────
// Common
//──────────────────────────────────────────────────────────────────────────────
const isProd = process.env.NODE_ENV === 'production';
const context = path.resolve(__dirname, SRC_DIR);
const extensions = ['.es', '.js', '.json']; // used in resolve
const outputPath = path.join(__dirname, DST_DIR);
const stats = {
	colors: true,
	hash: false,
	modules: false,
	moduleTrace: false,
	timings: false,
	version: false
};

//──────────────────────────────────────────────────────────────────────────────
// Server-side Javascript
//──────────────────────────────────────────────────────────────────────────────
const ALL_JS_ASSETS_GLOB = `${SRC_DIR}/${ASSETS_PATH_GLOB_BRACE}/**/${JS_EXTENSION_GLOB_BRACE}`;
//console.log(`ALL_JS_ASSETS_GLOB:${toStr(ALL_JS_ASSETS_GLOB)}`);

const ALL_JS_ASSETS_FILES = glob.sync(ALL_JS_ASSETS_GLOB);
//console.log(`ALL_JS_ASSETS_FILES:${toStr(ALL_JS_ASSETS_FILES)}`);

const SERVER_JS_FILES = glob.sync(`${SRC_DIR}/**/${JS_EXTENSION_GLOB_BRACE}`, {
	ignore: ALL_JS_ASSETS_FILES
});
// console.log(`SERVER_JS_FILES:${toStr(SERVER_JS_FILES)}`);

const SERVER_JS_CONFIG = {
	context,
	entry: dict(SERVER_JS_FILES.map(k => [
		k.replace(`${SRC_DIR}/`, '').replace(/\.[^.]*$/, ''), // name
		`.${k.replace(`${SRC_DIR}`, '')}` // source relative to context
	])),
	externals: [
		/\/lib\/(enonic|xp|menu|util|thymeleaf|http-client|cache)/
	],
	devtool: isProd ? false : 'source-map',
	mode: process.env.NODE_ENV,
	module: {
		rules: [{
			test: /\.(es6?|js)$/, // Will need js for node module depenencies
			use: [{
				loader: 'babel-loader',
				options: {
					//babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: isProd,
					presets: [
						[
							'@babel/preset-env',
							{
								// false means polyfill not required runtime
								useBuiltIns: false
							},
						],
					]
				} // options
			}] // use
		}] // rules
	}, // module
	output: {
		path: outputPath,
		filename: '[name].js',
		libraryTarget: 'commonjs'
	}, // output
	resolve: {
		alias: {
			'/content-types': path.resolve(__dirname, SRC_DIR, 'site', 'content-types', 'index.es'),
			'/lib': path.resolve(__dirname, SRC_DIR, 'lib')
		},
		extensions
	}, // resolve
	stats
};
//console.log(`SERVER_JS_CONFIG:${JSON.stringify(SERVER_JS_CONFIG, null, 4)}`);


//──────────────────────────────────────────────────────────────────────────────
// Javascript Assets
//──────────────────────────────────────────────────────────────────────────────
const ASSETS_JS_CONFIG = { // Javascript assets
	context,
	entry: {
		'assets/js/main.min': './assets/js/main.es'
	},
	devtool: isProd ? false : 'source-map',
	mode: process.env.NODE_ENV,
	module: {
		rules: [{
			test: /\.(es6?|js)$/,
			use: [{
				loader: 'babel-loader',
				options: {
					//babelrc: false, // The .babelrc file should only be used to transpile *.babel.js files.
					comments: false,
					compact: true,
					minified: isProd,
					presets: [
						[
							'@babel/preset-env',
							{
								// false means polyfill not required runtime
								useBuiltIns: false
							},
						],
					]
				} // options
			}] // use
		}] // rules
	}, // module
	optimization: {
		minimize: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					compress: {
						drop_console: false
					},
					mangle: false,
					keep_classnames: true,
					keep_fnames: true
				}
			})
		]
	},
	output: {
		path: outputPath,
		filename: '[name].js'
	},
	plugins: [
		new ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			'window.jQuery': 'jquery'
		}),
		new CopyPlugin({
			//Get highlight.js into the build
			patterns: [
				{
					from: path.resolve(__dirname, './node_modules/highlight.js/styles/foundation.css'),
					to: path.resolve(outputPath,  'assets/highlight/')
				}
			]
		})
	], // plugins
	resolve: {
		alias: {
			jquery: 'jquery/src/jquery'
		},
		extensions
	},
	stats
};
//console.log(`ASSETS_JS_CONFIG:${JSON.stringify(ASSETS_JS_CONFIG, null, 4)}`);


//──────────────────────────────────────────────────────────────────────────────
// Style assets
//──────────────────────────────────────────────────────────────────────────────
const STYLE_ASSETS_CONFIG = { // eslint-disable-line no-unused-vars
	context,
	entry: {
		//'assets/css/coderay': './assets/css/coderay.css',
		'assets/css/critical': './assets/css/critical.scss',
		'assets/css/non-critical': './assets/css/non-critical.scss'
	},
	mode: process.env.NODE_ENV,
	module: {
		rules: [{
			test: /\.s?css$/,
			use: [
				{loader: MiniCssExtractPlugin.loader, options: {publicPath: '../', hmr: false}},
				{loader: 'css-loader'},
				{
					loader: 'sass-loader', // compiles Sass to CSS
					options: {
						//errLogToConsole: true,
						importer: globImporter()//,
						//outputStyle: 'compressed'
					}
				}
			]
		}, {
			test: /\.svg$/,
			use: {
				loader: 'svg-url-loader',
				options: {
					// If given will tell the loader not to encode the source
					// file if its content is greater than this limit. Defaults
					// to no limit. If the file is greater than the limit the
					// file-loader is used and all query parameters are passed
					// to it.
					limit: 100000
				}
			}
		}, {
			test: /\.(jpe|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/,
			use: {
				loader: 'url-loader', //?limit=100000&name=assets/css/[name].[ext]'
				options: {
					limit: 100000,
					name: '[name].[ext]'
				}
			}
		}] // rules
	}, // module
	output: {
		path: outputPath,
		filename: '[name].css'
	},
	plugins: [
		new MiniCssExtractPlugin({
			filename: 'assets/css/styles.min.css'
		})
	],
	/*resolve: {
		modules: [
			path.resolve(__dirname, SRC_DIR, 'assets'),
			path.resolve(__dirname, SRC_DIR, 'site', 'assets'),
			'node_modules'
		]
	},*/
	stats
};
//console.log(`STYLE_ASSETS_CONFIG:${JSON.stringify(STYLE_ASSETS_CONFIG, null, 4)}`);

//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
const WEBPACK_CONFIG = [
	SERVER_JS_CONFIG,
	ASSETS_JS_CONFIG/*,
	STYLE_ASSETS_CONFIG*/
];

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
