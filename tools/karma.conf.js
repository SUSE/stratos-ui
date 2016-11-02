'use strict';

module.exports = function (config) {

  config.set({

    autoWatch: true,

    basePath: '../src/',

    browserDisconnectTimeout: 10000,

    browserNoActivityTimeout: 20000,

    browsers: ['PhantomJS'],

    coverageReporter: {
      type: 'html',
      dir: '../tools/.coverage-karma/'
    },

    files: [
      'lib/jquery/dist/jquery.js',
      'lib/angular-mocks/angular-mocks.js',
      'lib/angular-link-header-parser/release/angular-link-header-parser.min.js',
      '../tools/stackato-templates.js',

      'config.js',
      'plugins/*/plugin.config.js',

      'lib/helion-ui-framework/dist/**/*.html', {
        pattern: 'lib/helion-ui-framework/dist/images/*.png',
        watched: false,
        included: false,
        served: true,
        nocache: false
      }, {
        pattern: 'plugins/cloud-foundry/view/assets/**/*.png',
        watched: false,
        included: false,
        served: true,
        nocache: false
      },

      'index.module.js',
      'app/**/*.module.js',
      'app/**/!(*.mock|*.spec).js',
      'app/**/*.mock.js',
      'app/**/*.spec.js',
      'app/**/*.html',
      'plugins/**/*.module.js',
      'plugins/**/!(*.mock|*.spec).js',
      'plugins/**/*.mock.js',
      'plugins/**/*.spec.js',
      'plugins/**/*.html'
    ],

    frameworks: ['wiredep', 'jasmine'],

    ngHtml2JsPreprocessor: {
      stripPrefix: 'lib/helion-ui-framework/dist/',
      moduleName: 'templates'
    },

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered
      // (useful if karma exits without killing phantom)
      exitOnResourceError: true
    },

    plugins: [
      'karma-phantomjs-launcher',
      'karma-jasmine',
      'karma-ng-html2js-preprocessor',
      'karma-coverage',
      'karma-wiredep'
    ],

    preprocessors: {
      'lib/helion-ui-framework/dist/**/*.html': ['ng-html2js'],
      'app/**/*.html': ['ng-html2js'],
      'app/**/!(*.mock|*.spec).js': ['coverage'],
      'plugins/**/*.html': ['ng-html2js'],
      'plugins/cloud-foundry/!(api)/**/!(*.mock|*.spec).js': ['coverage'],
      'plugins/cloud-foundry/api/vcs/*.js': ['coverage'],
      'plugins/github/!(*.mock|*.spec).js': ['coverage']
    },

    proxies: {
      '/lib/helion-ui-framework/dist/images/': '/base/lib/helion-ui-framework/dist/images/',
      '/plugins/cloud-foundry/view/assets/': '/base/plugins/cloud-foundry/view/assets/'
    },

    reporters: ['progress', 'coverage']
  });
};
