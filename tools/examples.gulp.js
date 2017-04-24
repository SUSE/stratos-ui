/* eslint-disable angular/log,no-console,no-process-env */
(function () {
  'use strict';

  // Gulp tasks for the UI Framework Examples

  var config, paths;

  module.exports = function (c) {
    config = c;
    paths = config.paths;
  };

  var del = require('del');
  var path = require('path');
  var gulp = require('gulp');
  var rename = require('gulp-rename');
  var runSequence = require('run-sequence');
  var injectString = require('gulp-inject-string');
  var browserSync = require('browser-sync').create();
  var gutil = require('gulp-util');
  var utils = require('./gulp.utils');

  // Clean the examples dist folder
  gulp.task('examples:clean', function () {
    return del([paths.examplesDist + '**/*'], { force: true });
  });

  // Build the examples
  gulp.task('examples:dist', function (next) {
    paths.dist = path.join(__dirname, 'examples', 'dist') + '/';
    paths.frameworkDist = paths.dist + 'lib/';
    gutil.env.devMode = false;
    config.scssSourceFiles = [
      paths.src + 'framework.scss'
    ];

    runSequence(
      'examples:clean',
      'copy:js',
      'copy:bowerjs',
      'css',
      'examples:copy:theme',
      'examples:copy:templates',
      'examples:copy:examplesJs',
      'examples:copy:html',
      'examples:icons-preview',
       next
    );
  });

  gulp.task('examples:copy:theme', ['examples:oem:images'], function () {
    return gulp
      .src([
        paths.theme + '**/*',
        '!' + paths.theme + 'scss/**/*',
        '!' + paths.theme + '**/*.scss'
      ], {base: paths.theme})
      .pipe(gulp.dest(paths.examplesDist));
  });

  gulp.task('examples:oem:images', function () {
    var brandFolder = path.resolve(__dirname, '../oem/brands/suse');
    return gulp
      .src([
        brandFolder + '/images/*'
      ], {base: brandFolder})
      .pipe(gulp.dest(paths.examplesDist));
  });

  gulp.task('examples:copy:examplesJs', function () {
    return gulp
      .src(paths.examplesScripts + '**/*', {base: paths.examples})
      .pipe(gulp.dest(paths.examplesDist));
  });

  // Copy the Examples HTML file to dist
  gulp.task('examples:copy:html', ['examples:copy:html:framework'], function () {
    return gulp.src([
      paths.examples + 'index.html',
      paths.examples + 'theme_preview.html'
    ]).pipe(gulp.dest(paths.examplesDist));
  });

  // Copy the Framework HTML file to dist
  gulp.task('examples:copy:html:framework', function () {
    return gulp.src([
      paths.src + '**/framework/**/*.html'
    ]).pipe(gulp.dest(paths.examplesDist));
  });

  // Copy the Examples HTML file to dist
  gulp.task('examples:copy:templates', function () {
    return gulp.src([
      paths.framework + 'src/**/*.html'
    ]).pipe(gulp.dest(paths.examplesDist));
  });

  // Static server
  gulp.task('examples:dev', ['examples:dist'], function () {
    runSequence('examples:browsersync', 'examples:watch');
  });

  gulp.task('examples:browsersync', function (callback) {
    browserSync.init({
      server: {
        baseDir: paths.examplesDist
      }
    }, function () {
      callback();
    });
  });

  // Gulp watch JavaScript, SCSS and HTML source files
  gulp.task('examples:watch', function () {
    // Watch source and use correct task to update dist
    gulp.watch(utils.updateWithPlugins(config.jsSourceFiles), ['copy:js']);
    gulp.watch(config.examplesHtml, ['examples:copy:html']);
    gulp.watch(config.paths.theme + '**/*', ['examples:copy:theme']);
    gulp.watch(config.frameworkHtml, ['examples:copy:html:framework']);
    gulp.watch(paths.examples + '**/*.html', ['examples:copy:html']);
    gulp.watch(paths.theme + '**/*.scss', ['css']);

    // Watch dist for changes and reload with browsersync
    gulp.watch([
      paths.examplesDist + '**/*'
    ]).on('change', browserSync.reload);
  });

  gulp.task('examples:icons-preview', function () {
    var html = '\n';
    var iconScssFile = paths.theme + 'fonts/helion-icons/variables.scss';
    var lineReader = require('readline').createInterface({
      input: require('fs').createReadStream(iconScssFile)
    });
    var count = 0;
    lineReader.on('line', function (line) {
      if (line && line.length) {
        var icon = line.substr(1).split(':');
        icon = icon[0].trim();
        count++;
        var iconName = icon;
        var helionPrefix = 'helion-icon-';
        if (iconName.indexOf(helionPrefix) === 0) {
          iconName = iconName.substr(helionPrefix.length);
        }
        html += '<div><span class="helion-icon-lg helion-icon ' + icon + '"></span><span>' + iconName + '</span></div>\n';
      }
    }).on('close', function () {
      html += '\n';
      gulp.src(paths.examples + 'icons.tmpl.html')
        .pipe(injectString.after('<!-- icons-generated -->', html))
        .pipe(rename('icons.html'))
        .pipe(gulp.dest(paths.examplesDist));
      console.log('\nGenerated preview for ' + count + ' icons.');
    });
  });

})();
