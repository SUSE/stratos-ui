(function () {
  'use strict';

  /**
   * @namespace app.api
   * @memberOf app.api
   * @name app.api.account
   * @description Account access API
   */
  angular
    .module('app.api')
    .run(registerAccountApi);

  registerAccountApi.$inject = [
    '$http',
    '$httpParamSerializer',
    '$q',
    'app.api.apiManager'
  ];

  function registerAccountApi($http, $httpParamSerializer, $q, apiManager) {
    apiManager.register('app.api.account', new AccountApi($http, $httpParamSerializer, $q));
  }

  /**
   * @namespace app.api
   * @memberof app.api
   * @name app.api.account
   * @param {object} $http - the Angular $http service
   * @param {object} $httpParamSerializer - the Angular $httpParamSerializer service
   * @param {object} $q - the Angular Promise service
   * @property {object} $http - the Angular $http service
   * @property {object} $httpParamSerializer - the Angular $httpParamSerializer service
   * @property {object} $q - the Angular Promise service
   * @class
   */
  function AccountApi($http, $httpParamSerializer, $q) {
    this.$http = $http;
    this.$httpParamSerializer = $httpParamSerializer;
    this.$q = $q;
  }

  angular.extend(AccountApi.prototype, {
    /**
     * @function login
     * @memberof app.api.account.AccountApi
     * @param {string} username - the username
     * @param {string} password - the password
     * @description Log in of the application at model layer
     * @returns {object} A resolved/rejected promise
     * @public
     */
    login: function (username, password) {
      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      };
      var data = this.$httpParamSerializer({ username: username, password: password });
      return this.$http.post('/pp/v1/auth/login/uaa', data, config);
    },

    /**
     * @function logout
     * @memberof app.api.account.AccountApi
     * @description Log out at API layer, send XHR.
     * @returns {object} A resolved/rejected promise
     * @public
     */
    logout: function () {
      return this.$http.post('/pp/v1/auth/logout');
    },

    /**
     * @function verifySession
     * @memberof app.api.account.AccountApi
     * @description Verify validation of the session with cookie.
     * @returns {object} A resolved/rejected promise
     * @public
     */
    verifySession: function () {
      return this.$http.get('/pp/v1/auth/session/verify');
    },

    userInfo: function () {
      return this.$http.get('/pp/v1/userinfo');
    }

  });

})();
