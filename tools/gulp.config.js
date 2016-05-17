'use strict';

/**
 * This stores all the configuration information for Gulp
 */
module.exports = function () {
  var paths = {
    dist: '../dist/',
    src: '../src/',
    translations: '../translations/'
  };

  var config = {
    bower: {
      bowerJson: require('./bower.json'),
      directory: '../src/lib/',
      ignorePath: '../src/'
    },

    cssFiles: [
      paths.dist + 'index.css'
    ],

    jsFiles: [
      paths.dist + 'plugins/**/plugin.config.js',
      paths.dist + 'index.module.js',
      paths.dist + 'app/**/*.module.js',
      paths.dist + 'app/**/*.js',
      paths.dist + 'plugins/**/*.module.js',
      paths.dist + 'plugins/**/*.js',
      '!' + paths.dist + '**/*.mock.js',
      '!' + paths.dist + '**/*.spec.js'
    ],

    jsLibs: [
      paths.dist + 'lib/helion-ui-framework/src/**/*.module.js',
      paths.dist + 'lib/helion-ui-framework/src/**/*.js'
    ],

    jsSourceFiles: [
      'app/**/*.js',
      'plugin/**/*.js',
      '*.js',
      '!app/**/*.mock.js',
      '!app/**/*.spec.js',
      '!plugin/**/*.mock.js',
      '!plugin/**/*.spec.js'
    ],

    scssFiles: [
      'app/**/*.scss',
      'plugins/**/*.scss',
      '*.scss'
    ],

    scssSourceFiles: [
      'index.scss'
    ],

    partials: [
      'app/**/*.html',
      'plugins/**/*.html'
    ],

    paths: paths,

    plugins: [],

    translate: {
      dist: paths.dist + 'translations',
      js: paths.translations + 'js',
      options: {},
      po: paths.translations + 'po/**/*.po',
      pot: paths.translations + 'stratos.pot'
    }
  };

  return config;
};
