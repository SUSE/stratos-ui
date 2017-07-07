/* eslint-disable angular/log,no-console,no-process-env,no-sync */
(function () {
  'use strict';

  // Gulp tasks for the End to End tests (running with coverage)

  var config = require('./gulp.config');
  var paths = config.paths;

  /**
   * Tasks to run the end-to-end (e2e) selenium/protractor tests
   **/

  var _ = require('lodash');
  var gulp = require('gulp');
  var del = require('delete');
  var fork = require('child_process').fork;
  var path = require('path');
  var runSequence = require('run-sequence');
  var ngAnnotate = require('gulp-ng-annotate');

  var components;
  gulp.task('prepare:e2e', function () {
    components = require('./components');
  });

  gulp.task('e2e:clean:dist', function (next) {
    del('../tmp', {force: true}, next);
  });

  gulp.task('coverage-combine', function (cb) {
    var combine = require('istanbul-combine');
    var coverageDir = path.resolve(__dirname, '..', 'out', 'coverage-report');
    var opts = {
      dir: path.join(coverageDir, 'combined'),
      pattern: path.join(coverageDir, '_json/*.json'),
      print: 'summary',
      reporters: {
        html: {}
      }
    };
    combine(opts, cb);
  });

  gulp.task('e2e:tests', function (cb) {
    // Use the protractor in our node_modules folder
    var cmd = './node_modules/protractor/bin/protractor';
    var options = {};
    options.env = _.clone(process.env);
    options.env.NODE_ENV = 'development';
    options.env.env = 'development';

    var args = ['./build/coverage.conf.js'];
    if (process.env.STRATOS_E2E_SUITE) {
      args.push('--suite');
      args.push(process.env.STRATOS_E2E_SUITE);
    }

    var c = fork(cmd, args, options);
    c.on('close', function () {
      cb();
    });
  });

  gulp.task('e2e:pre-instrument', function () {
    return gulp.src(paths.dist + '**/*.*')
      .pipe(gulp.dest(paths.instrumented));
  });

  gulp.task('e2e:instrument-source', ['prepare:e2e'], function () {
    var istanbul = require('gulp-istanbul');
    var sources = components.getGlobs([
      '**/*.js',
      '!**/*.spec.js',
      '!**/*.mock.js'
    ]);
    return gulp.src(sources.dist, {base: paths.dist})
      .pipe(ngAnnotate({
        single_quotes: true
      }))
      .pipe(istanbul(config.istanbul))
      .pipe(gulp.dest(paths.instrumented));
  });

  gulp.task('e2e:run', function () {
    paths.browserSyncDist = paths.instrumented;
    config.browserSyncPort = 4000;
    config.disableServerLogging = true;
    runSequence(
      'e2e:clean:dist',
      'dev-build',
      'e2e:pre-instrument',
      'e2e:instrument-source',
      'start-server',
      'e2e:tests',
      'stop-server',
      'e2e:clean:dist'
    );
  });

  gulp.task('e2e:runq', function () {
    paths.browserSyncDist = paths.instrumented;
    config.browserSyncPort = 4000;
    config.disableServerLogging = true;
    runSequence(
      'start-server',
      'e2e:tests',
      'stop-server'
    );
  });
})();
