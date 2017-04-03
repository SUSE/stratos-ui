(function () {
  'use strict';

  /**
   * @namespace app.api
   * @memberof app
   * @name api
   * @description The API layer of the UI platform that handles HTTP requests
   */
  angular
    .module('app.api', [], config);

  config.$inject = [
    '$httpProvider'
  ];

  function config($httpProvider) {
    $httpProvider.interceptors.push(interceptor);
  }

  interceptor.$inject = [
    '$q',
    'appEventEventService'
  ];

  /**
   * @name interceptor
   * @description A $http interceptor, which emits a global HTTP error event when
   * response.status >= 400
   *
   * See https://docs.angularjs.org/api/ng/service/$http for details
   *
   * @param {object} $q - the $q service for promise/deferred objects
   * @param {object} appEventEventService - the event bus service
   * @returns {object} The response error function
   */
  function interceptor($q, appEventEventService) {
    return {
      responseError: responseError
    };

    function responseError(response) {
      appEventEventService.$emit('HTTP_' + response.status, response);
      return $q.reject(response);
    }
  }

})();
