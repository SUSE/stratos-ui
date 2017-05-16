(function () {
  'use strict';

  var angularModules = [
    'ngCookies',
    'ngSanitize'
  ];

  var otherModules = [
    'console-templates',
    'angularMoment',
    'gettext',
    'helion.framework',
    'smoothScroll',
    'ui.bootstrap',
    'ui.router',
    'smart-table',
    'pascalprecht.translate'
  ];

  var pluginModules = _.chain(env.plugins).map('moduleName').value();

  /**
   * @namespace console-app
   * @name console-app
   */
  angular
    .module('console-app', angularModules.concat(otherModules, ['app'], pluginModules), config)
    .factory('missingTranslateHandler', missingTranslateHandler);

  function config($compileProvider, $logProvider, $translateProvider) {

    /**
     * Disabling Debug Data
     *
     * To manually enable debug data, open up a debug console in the browser
     * then call this method directly in this console:
     *
     * ```
     * angular.reloadWithDebugInfo();
     * ```
     *
     * https://docs.angularjs.org/guide/production
     */
    $compileProvider.debugInfoEnabled(false);

    $logProvider.debugEnabled(false);

    // Configure i18n
    $translateProvider.preferredLanguage('en');
    $translateProvider.fallbackLanguage('en');
    $translateProvider.useSanitizeValueStrategy(null);

    $translateProvider.useStaticFilesLoader({
      prefix: '/i18n/locale-',
      suffix: '.json'
    });

    // Uncomment this for development to see which strings need localizing
    $translateProvider.useMissingTranslationHandler('missingTranslateHandler');
  }

  // Custom missing translation handler only logs each missing translation id once
  function missingTranslateHandler($log) {

    var seen = {};

    return function (translationId) {
      if (!seen[translationId]) {
        $log.warn('Missing translation for "' + translationId + '"');
        seen[translationId] = true;
      }

      // Highlight missing translations (breaks unit tests)
      //return '<span class="i18n-missing">' + translationId + '</span>';
    };
  }

})();
