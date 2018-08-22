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

  function registerAccountApi($http, $httpParamSerializer, $window, apiManager) {
    apiManager.register('app.api.account', new AccountApi($http, $httpParamSerializer, $window));
  }

  /**
   * @namespace app.api
   * @memberof app.api
   * @name app.api.account
   * @param {object} $http - the Angular $http service
   * @param {object} $httpParamSerializer - the Angular $httpParamSerializer service
   * @property {object} $http - the Angular $http service
   * @property {object} $httpParamSerializer - the Angular $httpParamSerializer service
   * @class
   */
  function AccountApi($http, $httpParamSerializer, $window) {

    return {
      login: login,
      logout: logout,
      verifySession: verifySession,
      userInfo: userInfo,
      isSSOLogin: isSSOLogin,
      ssoLogin: ssoLogin
    };

    /**
     * @function login
     * @memberof app.api.account.AccountApi
     * @param {string} username - the username
     * @param {string} password - the password
     * @description Log in of the application at model layer
     * @returns {object} A resolved/rejected promise
     * @public
     */
    function login(username, password) {
      var config = {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-cap-request-date': moment().unix()
        }
      };
      var data = $httpParamSerializer({ username: username, password: password });
      return $http.post('/pp/v1/auth/login/uaa', data, config);
    }

    function ssoLogin() {
      if (!$window.location.origin) {
        $window.location.origin = $window.location.protocol + '//' + $window.location.hostname + ($window.location.port ? ':' + $window.location.port : '');
      }
      var returnUrl = encodeURI($window.location.origin);
      $window.open('/pp/v1/auth/sso_login?state=' + returnUrl, '_self');
      return {
        then: function () {},
        catch: function () {}
      };
    }

    /**
     * @function logout
     * @memberof app.api.account.AccountApi
     * @description Log out at API layer, send XHR.
     * @returns {object} A resolved/rejected promise
     * @public
     */
    function logout() {
      return $http.post('/pp/v1/auth/logout');
    }

    /**
     * @function verifySession
     * @memberof app.api.account.AccountApi
     * @description Verify validation of the session with cookie.
     * @returns {object} A resolved/rejected promise
     * @public
     */
    function verifySession() {
      var config = {
        headers: {
          'x-cap-request-date': moment().unix()
        }
      };
      return $http.get('/pp/v1/auth/session/verify', config);
    }

    function userInfo() {
      return $http.get('/pp/v1/userinfo');
    }

    function isSSOLogin(e) {
      return e.headers && e.headers('x-stratos-sso-login') === 'true';
    }

  }

})();
