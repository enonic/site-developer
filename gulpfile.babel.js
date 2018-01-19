//'use strict';
import gulp from 'gulp';
import sass from 'gulp-sass';
import sassGlob from 'gulp-sass-glob';

import sourcemaps from 'gulp-sourcemaps'; // CSS sourcemaps

import autoprefixer from 'gulp-autoprefixer'; // Autoprefixer, adds vendor specific css

import htmlmin from 'gulp-htmlmin'; // HTML minification

import jshint from 'gulp-jshint';

// Webpack
import gulpWebpack from 'webpack-stream';

// Image minification
import imagemin from 'gulp-imagemin';
import pngquant from 'imagemin-pngquant'; // $ npm i -D imagemin-pngquant

import svgstore from 'gulp-svgstore';
import path from 'path';
//import inject from 'gulp-inject';
import svgmin from 'gulp-svgmin';

import webpackConfig from './webpack.config.js';

// Folder variables
const srcSite = 'src/main/resources';
const buildSite = 'build/resources/main';
const srcAssets = `${srcSite}/assets`;
const buildAssets = `${buildSite}/assets`;

// Sass compile
const sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed'
};


// Default task, runs all other tasks
gulp.task('build', ['sass', 'webpack', 'minifyImages', 'svgstore', 'minifyHTML']);

// Compile Sass files
// Create CSS sourcemaps
// Add vendor specific CSS
gulp.task('sass', () => gulp
    .src(`${srcAssets}/css/*.scss`)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass(sassOptions).on('error', sass.logError))
    .pipe(sourcemaps.write())
    .pipe(autoprefixer())
    .pipe(gulp.dest(`${buildAssets}/css/`))
    .resume());

// Minify PNG, JPEG, GIF and SVG images in assets folder
gulp.task('minifyImages', () => gulp
    .src(`${srcAssets}/img/*`)
    .pipe(imagemin({
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        use: [pngquant()]
    }))
    .pipe(gulp.dest(`${buildAssets}/img`)));

// JSHint, Helps to detect errors and potential problems in code
gulp.task('jsHint', () => gulp
    .src([`${srcAssets}/js/*.js${srcAssets}/js/plugins/!*.js`])
    .pipe(jshint())
    .pipe(jshint.reporter('default')));

// Minify the HTML of all components
gulp.task('minifyHTML', () => gulp.src(`${srcSite}/**/*.html`)
    .pipe(htmlmin({
        collapseWhitespace: true,
        removeComments: true,
        keepClosingSlash: true
    }))
    .pipe(gulp.dest(buildSite)));

// Runs webpack module bundler
gulp.task('webpack', () => gulp
    .src(`${srcAssets}/js/main.js`)
    .pipe(gulpWebpack(webpackConfig))
    .pipe(gulp.dest(`${buildAssets}/js`)));

gulp.task('svgstore', () => gulp
    .src(`${srcAssets}/img/icons/*.svg`)
    .pipe(svgmin((file) => {
        const prefix = path.basename(file.relative, path.extname(file.relative));
        return {
            plugins: [{
                cleanupIDs: {
                    prefix: `${prefix}-`,
                    minify: true
                }
            }]
        };
    }))
    .pipe(svgstore({inlineSvg: true}))
    .pipe(gulp.dest(`${buildAssets}/img/icons`)));


/*
gulp.task('svgstore', function () {
    const svgs = gulp
        .src(srcAssets + '/img/icons/!*.svg')
        .pipe(svgstore({ inlineSvg: true }));

    function fileContents (filePath, file) {
        return file.contents.toString();
    }

    return gulp
        .src(srcAssets + '/img/icons/icons-test.html')
        .pipe(inject(svgs, { transform: fileContents }))
        .pipe(gulp.dest(buildAssets + '/img/icons/inline'));
});*/
