// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html
module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('karma-spec-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('./build/karma.test.reporter.js')
    ],
    client: {
      clearContext: !!process.env.CI_ENV, // leave Jasmine Spec Runner output visible in browser
      captureConsole: false,
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, 'coverage'), reports: ['html', 'lcovonly', 'json'],
      fixWebpackSourcePaths: true
    },
    angularCli: {
      environment: 'dev'
    },
    reporters: process.env.CI_ENV ? ['spec'] : ['spec', 'kjhtml', 'stratos'],
    port: 9876,
    colors: true,
    logLevel: config.DEBUG,
    autoWatch: false,
    browsers: process.env.CI_ENV ? ['StratosChromeHeadless'] : ['Chrome'],
    customLaunchers: {
      StratosChromeHeadless:{
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    singleRun: process.env.CI_ENV ? true : false,
    files: [{
        pattern: './src/frontend/**/*.spec.ts',
        watched: false
      },
      {
        pattern: './node_modules/@angular/material/prebuilt-themes/indigo-pink.css',
        watched: false
      }
    ],
  });
};
