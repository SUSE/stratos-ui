(function () {
  'use strict';

  /**
   * @namespace app.model.account
   * @memberOf app.model
   * @name account
   * @description Account model
   */
  angular
    .module('app.model')
    .run(registerAccountModel);

  registerAccountModel.$inject = [
    '$cookies',
    'app.model.modelManager',
    'app.api.apiManager'
  ];

  function registerAccountModel($cookies, modelManager, apiManager) {
    modelManager.register('app.model.account', new Account($cookies, apiManager));
  }

  /**
   * @namespace app.model.account.Account
   * @memberof app.model.account
   * @name app.model.account.Account
   * @param {object} $cookies - the Angular $cookies service
   * @param {app.api.apiManager} apiManager - the application API manager
   * @property {object} $cookies - the Angular $cookies service
   * @property {app.api.apiManager} apiManager - the application API manager
   * @property {boolean} loggedIn - a flag indicating if user logged in
   * @property {object} data - the account data object
   * @class
   */
  function Account($cookies, apiManager) {
    this.$cookies = $cookies;
    this.apiManager = apiManager;
    this.loggedIn = false;
    this.data = {};
  }

  angular.extend(Account.prototype, {
    /**
     * @function login
     * @memberof app.model.account.Account
     * @description Log in of the application at model layer
     * @param {string} username - the username
     * @param {string} password - the password
     * @returns {promise} A promise object
     * @public
     */
    login: function (username, password) {
      var that = this;
      var accountApi = this.apiManager.retrieve('app.api.account');
      return accountApi.login(username, password)
        .then(function (response) {
          that.onLoggedIn(response);
        });
    },

    /**
     * @function logout
     * @memberof app.model.account.Account
     * @description Log out of the application at model layer
     * @returns {promise} A promise object
     * @public
     */
    logout: function () {
      var that = this;
      var accountApi = this.apiManager.retrieve('app.api.account');
      return accountApi.logout()
        .then(function () {
          that.onLoggedOut();
        });
    },

    /**
     * @function verifySession
     * @memberof app.model.account.Account
     * @description verify if current session
     * @public
     * @returns {promise} A promise object
     */
    verifySession: function () {
      var accountApi = this.apiManager.retrieve('app.api.account');
      var p = accountApi.verifySession();
      var that = this;

      p.then(
        function (response) {
          that.onLoggedIn(response);
        },
        function () {
          that.onLoggedOut();
        }
      );

      return p;
    },

    /**
     * @function isAdmin
     * @memberof app.model.account.Account
     * @description Return true if this user is an ITOps admin
     * @public
     * @returns {boolean} True if this user is an ITOps admin
     */
    isAdmin: function () {
      return this.data && this.data.isAdmin;
    },

    /**
     * @function onLoggedIn
     * @memberof app.model.account.Account
     * @description Logged-in handler at model layer
     * @param {object} response - the HTTP response object
     * @private
     */
    onLoggedIn: function (response) {
      this.loggedIn = true;

      var loginRes = response.data;
      this.data = {
        username: loginRes.account,
        isAdmin: loginRes.admin
      };
    },

    /**
     * @function onLoggedOut
     * @memberof app.model.account.Account
     * @description Logged-out handler at model layer
     * @private
     */
    onLoggedOut: function () {
      var sessionName = this.apiManager.retrieve('app.api.account').sessionName;
      this.$cookies.remove(sessionName);
      this.loggedIn = false;
      delete this.data;
    }

  });

})();
