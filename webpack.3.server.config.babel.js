/* eslint-disable no-console */
//──────────────────────────────────────────────────────────────────────────────
// Imports
//──────────────────────────────────────────────────────────────────────────────
import glob from 'glob';
import path from 'path';


//──────────────────────────────────────────────────────────────────────────────
// Functions
//──────────────────────────────────────────────────────────────────────────────
//const toStr = v => JSON.stringify(v, null, 4);
const dict = arr => Object.assign(...arr.map(([k, v]) => ({ [k]: v })));


//──────────────────────────────────────────────────────────────────────────────
// Constants
//──────────────────────────────────────────────────────────────────────────────
const EXTENSIONS_GLOB = '{es,js}';
const SRC_DIR = 'src/main/resources';
const SRC_DIR_ABS = path.resolve(__dirname, SRC_DIR);

const DST_DIR = 'build/resources/main';
const DST_DIR_ABS = path.join(__dirname, DST_DIR);

const ASSETS_GLOB = `${SRC_DIR}/{site/assets,assets}/**/*.${EXTENSIONS_GLOB}`;
//console.log(`ASSETS_GLOB:${JSON.stringify(ASSETS_GLOB, null, 4)}`);
//console.log(`ASSET_FILES:${JSON.stringify(glob.sync(ASSETS_GLOB), null, 4)}`);

const FILES = glob.sync(`${SRC_DIR}/**/*.${EXTENSIONS_GLOB}`, {ignore: ASSETS_GLOB});
//console.log(`FILES:${toStr(FILES)}`);


//──────────────────────────────────────────────────────────────────────────────
// Exports
//──────────────────────────────────────────────────────────────────────────────
const WEBPACK_CONFIG = {
    context: SRC_DIR_ABS,
    entry: dict(FILES.map(k => [
        k.replace(`${SRC_DIR}/`, '').replace(/\.[^.]*$/, ''), // name
        `.${k.replace(`${SRC_DIR}`, '')}` // source relative to context
    ])),
    externals: [
        /\/lib\/(enonic|xp)/
    ],
    devtool: false, // Don't waste time generating sourceMaps
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
        path: DST_DIR_ABS,
        filename: '[name].js',
        libraryTarget: 'commonjs'
    }, // output
    resolve: {
        alias: {
            '/content-types': path.resolve(__dirname, SRC_DIR, 'site/content-types/index.es'),
            '/lib': path.resolve(__dirname, SRC_DIR, 'lib')
        },
        extensions: ['.es', '.js', '.json']
    }, // resolve
    stats: {
        colors: true,
        hash: false,
        maxModules: 0,
        modules: false,
        moduleTrace: false,
        timings: false,
        version: false
    } // stats
};

//console.log(`WEBPACK_CONFIG:${JSON.stringify(WEBPACK_CONFIG, null, 4)}`);
//process.exit();

export { WEBPACK_CONFIG as default };
