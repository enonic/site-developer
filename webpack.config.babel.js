/* eslint-disable no-console */
//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
//import ExtractTextPlugin, {extract as extractText} from 'extract-text-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import glob from 'glob';
import globImporter from 'node-sass-glob-importer';
//import MinifyPlugin from 'babel-minify-webpack-plugin';
import path from 'path';
import {ProvidePlugin} from 'webpack';
import UglifyJsPlugin from 'uglifyjs-webpack-plugin'; // Supports ECMAScript2015


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
const context = path.resolve(__dirname, SRC_DIR);
const extensions = ['.es', '.js', '.json']; // used in resolve
const mode = 'development';
const outputPath = path.join(__dirname, DST_DIR);
const stats = {
	colors: true,
	hash: false,
	maxModules: 0,
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
	devtool: false, // Don't waste time generating sourceMaps
	mode,
	module: {
		rules: [{
			test: /\.(es6?|js)$/, // Will need js for node module depenencies
			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile config files.
					comments: false,
					compact: false,
					minified: false,
					plugins: [
						'array-includes',
						'optimize-starts-with',
						'transform-object-assign',
						'transform-object-rest-spread'
					],
					presets: ['es2015']
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
	devtool: 'source-map', // https://webpack.js.org/configuration/devtool/
	mode,
	module: {
		rules: [{
			test: /\.(es6?|js)$/,
			use: [{
				loader: 'babel-loader',
				options: {
					babelrc: false, // The .babelrc file should only be used to transpile *.babel.js files.
					comments: false,
					compact: true,
					minified: true,
					plugins: [
						'array-includes',
						'optimize-starts-with',
						'transform-object-assign',
						'transform-object-rest-spread'
					],
					presets: [
						[
							'env', {
								modules: false // NOTE svg4everybody fails runtime without this!
							}
						]
					]
				} // options
			}] // use
		}] // rules
	}, // module
	optimization: {/*
		minimizer: [
			new UglifyJsPlugin({ // TODO this seems to remove the source map file
				parallel: true, // highly recommended
				sourceMap: true // default is false and overrides devtool? So both is needed.
			})
		]*/
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
		'assets/css/coderay': './assets/css/coderay.css',
		'assets/css/critical': './assets/css/critical.scss',
		'assets/css/non-critical': './assets/css/non-critical.scss'
	},
	mode,
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
