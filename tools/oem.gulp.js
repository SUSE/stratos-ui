/* eslint-disable angular/log,no-console,no-process-env,no-sync */
(function () {
  'use strict';

  // Gulp tasks to support OEM

  var config, paths;

  module.exports = function (c) {
    config = c;
    paths = config.paths;
  };

  var gulp = require('gulp');
  var gutil = require('gulp-util');
  var fs = require('fs');
  var path = require('path');
  var fsx = require('fs-extra');
  var del = require('delete');
  var endOfLine = require('os').EOL;
  var index = 1;

  var importRegEx = /^@import ["'](.*)["']/i;
  var importSplitRegEx = /["'](.*)["']/i;

  function findFile(base, importFile) {
    var outName = index + '_' + path.basename(importFile);
    var file = path.resolve(base, importFile);
    index = index + 1;
    if (path.extname(file) !== '.scss') {
      file = file + '.scss';
      outName = outName + '.scss';
    }
    if (!fs.existsSync(file)) {
      file = path.join(path.dirname(file), '_' + path.basename(file));
      outName = '_' + outName;
      if (!fs.existsSync(file)) {
        throw new gutil.PluginError({
          plugin: 'oem',
          message: 'Can not find file:' + scssFile
        });
      }
    }
    return {
      file: file,
      outName: outName
    };
  }

  function processFile(scssFile, outputFile) {
    var outputFolder = path.dirname(outputFile);
    fs.writeFileSync(outputFile, '', 'utf8');
    var splitImport = false;
    var base = path.dirname(scssFile);
    var lines = fs.readFileSync(scssFile, 'utf8').toString().split('\n');
    lines.forEach(function (line, i) {
      var tline = line.trim();
      var found = false;
      if (splitImport) {
        found = tline.match(importSplitRegEx);
      } else {
        found = tline.match(importRegEx);
      }
      if (found && found.length > 1) {
        splitImport = tline.indexOf(';') === -1;
        var importFile = found[1];
        var meta = findFile(base, importFile);
        fs.appendFileSync(outputFile, '@import \"' + meta.outName + '\";' + endOfLine);
        processFile(meta.file, path.join(outputFolder, meta.outName));
      } else {
        if (!(i === lines.length - 1 && tline.length === 0)) {
          fs.appendFileSync(outputFile, line.toString() + endOfLine);
        }
      }
    });
  }

  gulp.task('oem:clean', function (next) {
    del(paths.oem + 'scss/*', {force: true}, next);
  });

  gulp.task('oem', ['oem:clean'], function (done) {
    var file = paths.src + 'index.scss';
    var outputFile = paths.oem + 'scss/index.scss';
    fsx.ensureDirSync(path.dirname(outputFile));
    // Start with an empty output file
    fs.writeFileSync(outputFile, '', 'utf8');
    processFile(file, outputFile);
    done();
  });

})();
