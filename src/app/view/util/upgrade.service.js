(function () {
  'use strict';

  angular
  .module('app.view')
  .factory('appUpgradeCheck', upgradeCheckFactory)
  .config(upgradeCheckInterceptor);

  /**
  * @namespace appUpgradeCheck
  * @memberof app.view
  * @name app.view.appUpgradeCheck
  * @param {object} $httpProvider - angular's $httpProvider object
  * @description Installs the Upgrade Cherk interceptor into the http chain.
  */
  function upgradeCheckInterceptor($httpProvider) {
    $httpProvider.interceptors.push('appUpgradeCheck');
  }

  /**
  * @namespace appUpgradeCheck
  * @memberof app.view
  * @name app.view.appUpgradeCheck
  * @param {object} $q - the Angular Promise service
  * @param {object} appEventService - the event bus service
  * @description The utlity will intercept all HTTP responses and check for 503/upgrade responses
  * @returns {object} The upgrade check service
  */
  function upgradeCheckFactory($q, appEventService) {
    /**
    * @function isUpgrading
    * @memberof app.view.appUpgradeCheck
    * @param {object} response - $http reponse object
    * @description Checks if the supplied response indicates an upgrade in progress
    * @returns {boolean} Flag indicating if upgrade in progress
    */

    function isUpgrading(response) {
      return response.status === 503 && !!response.headers('Retry-After') && response.config.url.indexOf('/pp') === 0;
    }

    return {
      isUpgrading: isUpgrading,

      /**
      * @function responseError
      * @memberof app.view.appUpgradeCheck
      * @param {object} rejection - $http reponse object
      * @description HTTP Interceptor function for processing respons errors
      * @returns {promise} For onward error processing
      */
      responseError: function (rejection) {
        // rejection is a response object
        // Must be a 503 with the Retry-After header and mst be do a Portal Proxy URL
        if (isUpgrading(rejection)) {
            // This indicates upgrade in progress, so change state to an upgrade error page
          appEventService.$emit(appEventService.events.TRANSFER, 'error-page', {error: 'upgrading', hideAccount: true});
        }
        // Always return the rejection as it was
        return $q.reject(rejection);
      }
    };
  }

})();
