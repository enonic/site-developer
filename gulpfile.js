'use strict';

// Folder variables
var srcSite = 'src/main/resources';
var buildSite = 'build/resources/main';
var srcAssets = srcSite + '/assets';
var buildAssets = buildSite + '/assets';

var gulp = require('gulp');

// Sass compile
var sass = require('gulp-sass');
var sassGlob = require('gulp-sass-glob');
var sassOptions = {
    errLogToConsole: true,
    outputStyle: 'compressed'
};

// CSS sourcemaps
var sourcemaps = require('gulp-sourcemaps');

// Autoprefixer, adds vendor specific css
var autoprefixer = require('gulp-autoprefixer');

// HTML minification
var htmlmin = require('gulp-htmlmin');

var jshint = require('gulp-jshint');

// Webpack
var gulpWebpack = require('webpack-stream');

// Image minification
var imagemin = require('gulp-imagemin');
var pngquant = require('imagemin-pngquant'); // $ npm i -D imagemin-pngquant

var svgstore = require('gulp-svgstore');
var path = require('path');
//var inject = require('gulp-inject');
var svgmin = require('gulp-svgmin');

// Default task, runs all other tasks
gulp.task('build', ['sass', 'jsHint', 'webpack', 'minifyImages', 'svgstore', 'minifyHTML']);

// Compile Sass files
// Create CSS sourcemaps
// Add vendor specific CSS
gulp.task('sass', function () {
    return gulp
        .src(srcAssets + '/css/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sassGlob())
        .pipe(sass(sassOptions).on('error', sass.logError))
        .pipe(sourcemaps.write())
        .pipe(autoprefixer())
        .pipe(gulp.dest(buildAssets + '/css/'))
        .resume();
});

// Minify PNG, JPEG, GIF and SVG images in assets folder
gulp.task('minifyImages', function () {
    return gulp
        .src(srcAssets + '/img/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{removeViewBox: false}],
            use: [pngquant()]
        }))
        .pipe(gulp.dest(buildAssets + '/img'));
});

// JSHint, Helps to detect errors and potential problems in code
gulp.task('jsHint', function() {
    return gulp
        .src([srcAssets + '/js/*.js', srcAssets + '/js/plugins/!*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

// Minify the HTML of all components
gulp.task('minifyHTML', function() {
    return gulp.src(srcSite + '/**/*.html')
        .pipe(htmlmin({
            collapseWhitespace: true,
            removeComments: true,
            keepClosingSlash: true
        }))
        .pipe(gulp.dest(buildSite))
});

// Runs webpack module bundler
gulp.task('webpack', function() {
    return gulp
        .src(srcAssets + '/js/main.js')
        .pipe(gulpWebpack(require('./webpack.config.js')))
        .pipe(gulp.dest(buildAssets + '/js'));
});

gulp.task('svgstore', function () {
    return gulp
        .src(srcAssets + '/img/icons/*.svg')
        .pipe(svgmin(function (file) {
            var prefix = path.basename(file.relative, path.extname(file.relative));
            return {
                plugins: [{
                    cleanupIDs: {
                        prefix: prefix + '-',
                        minify: true
                    }
                }]
            }
        }))
        .pipe(svgstore({inlineSvg: true}))
        .pipe(gulp.dest(buildAssets + '/img/icons'));
});


/*
gulp.task('svgstore', function () {
    var svgs = gulp
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
