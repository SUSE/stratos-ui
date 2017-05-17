(function () {
  'use strict';

  var _ = require('lodash');
  var path = require('path');
  var components = require('./components');

  module.exports = function (config) {

    var reportPath = path.resolve(__dirname, '..', 'out/coverage-report');

    var karmaConfig = {
      autoWatch: false,

      basePath: '../',

      browserDisconnectTimeout: 10000,

      browserNoActivityTimeout: 20000,

      browsers: ['PhantomJS'],
      //browsers: ['Chrome_Headless'],

      customLaunchers: {
        Chrome_Headless: {
          base: 'Chrome',
          flags: ['--headless']
        }
      },

      coverageReporter: {
        dir: reportPath,
        reporters: [
          { type: 'html', subdir: 'unit' },
          { type: 'json', subdir: '_json', file: 'unit-coverage.json' }
        ]
      },

      files: [
        'node_modules/jasmine-jquery/lib/jasmine-jquery.js',
        'bower_components/angular-mocks/angular-mocks.js',
        'src/config.js',
        'build/unit-test-helpers.js',
        'dist/svg/**/*.svg',
        {
          pattern: 'dist/i18n/*.json',
          watched: false,
          included: false,
          served: true,
          nocache: false
        },
        {
          pattern: 'dist/images/**/*.png',
          watched: false,
          included: false,
          served: true,
          nocache: false
        },
        // use the HTML templates compiled into a template cahce
        'dist/console-templates.js'

        // src and test files are added based on which components are specified in bower.json
      ],

      frameworks: ['wiredep', 'jasmine'],

      // Required when running in intellij
      // wiredep: {
      //   cwd: '../'
      // },

      ngHtml2JsPreprocessor: {
        moduleName: 'templates',
        cacheIdFromPath: function (filePath) {
          if (filePath.indexOf('dist/') === 0) {
            return filePath.substr(5);
          } else {
            return filePath;
          }
        }
      },

      phantomjsLauncher: {
        // Have phantomjs exit if a ResourceError is encountered
        // (useful if karma exits without killing phantom)
        exitOnResourceError: true
      },

      plugins: [
        'karma-phantomjs-launcher',
        'karma-chrome-launcher',
        'karma-jasmine',
        'karma-ng-html2js-preprocessor',
        'karma-coverage',
        'karma-wiredep',
        require('./karma-ngannotate')
      ],

      preprocessors: {
        'dist/svg/**/*.svg': ['ng-html2js']
        //'components/**/src/**/*.js': ['ngannotate', 'coverage']
        //'components/**/src/!(api)/**/!(*.mock|*.spec).js': ['ngannotate', 'coverage']
      },

      proxies: {
        '/images/': '/base/dist/images/',
        '/svg/': '/base/dist/svg/',
        '/i18n/': '/base/dist/i18n/',
        '/fonts/': '/base/dist/fonts/'
      },

      reporters: ['progress', 'coverage'],

      //logLevel: config.LOG_DEBUG,

      singleRun: true
    };

    // Add in the test folders only for the components that are referneced in the bower file
    var pluginFiles = components.getLocalGlobs('src/plugin.config.js');
    var moduleFiles = components.getLocalGlobs('src/**/*.module.js');
    var srcFiles = components.getLocalGlobs('src/**/*.js');
    var testFiles = components.getLocalGlobs(['test/**/*.mock.js', 'test/**/*.spec.js']);
    karmaConfig.files = _.concat(karmaConfig.files, pluginFiles, moduleFiles, srcFiles, testFiles);

    // Add the cannotation and overage pre-processors for the component source
    _.each(srcFiles, function (glob) {
      karmaConfig.preprocessors[glob] = ['ngannotate', 'coverage'];
    });

    config.set(karmaConfig);
  };
})();
