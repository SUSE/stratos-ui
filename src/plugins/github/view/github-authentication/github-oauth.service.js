(function () {
  'use strict';

  angular
    .module('github.view')
    .factory('github.view.githubOauthService', githubOauthServiceFactory);

  githubOauthServiceFactory.$inject = [
    '$window',
    '$q',
    'GITHUB_ENDPOINTS'
  ];

  /**
   * @memberof github.view
   * @name githubOauthServiceFactory
   * @constructor
   * @param {object} $window - angular $window service
   * @param {object} $q - angular $q service
   * @param {GITHUB_ENDPOINTS} GITHUB_ENDPOINTS - the public Github Endpoints
   */
  function githubOauthServiceFactory($window, $q, GITHUB_ENDPOINTS) {
    return new GithubOauthService($window, $q, GITHUB_ENDPOINTS);
  }

  /**
   * @memberof github.view
   * @name GithubOauthService
   * @constructor
   * @param {object} $window - angular $window service
   * @param {object} $q - angular $q service
   * @param {GITHUB_ENDPOINTS} GITHUB_ENDPOINTS - the public Github Endpoints
   * @property {object} $window - angular $window service
   * @property {object} $q - angular $q service
   * @property {GITHUB_ENDPOINTS} GITHUB_ENDPOINTS - the public Github Endpoints
   */
  function GithubOauthService($window, $q, GITHUB_ENDPOINTS) {
    this.$window = $window;
    this.$q = $q;
    this.GITHUB_ENDPOINTS = GITHUB_ENDPOINTS;
  }

  angular.extend(GithubOauthService.prototype, {
    start: function (endpoint) {
      var that = this;
      var url = '/pp/v1/vcs/oauth/auth?endpoint=' + (endpoint || this.GITHUB_ENDPOINTS.URL);
      var win = this.$window.open(url, '_blank');
      win.focus();

      return this.$q(function (resolve, reject) {
        that.$window.addEventListener('message', function (event) {
          var message = angular.fromJson(event.data);
          if (message.name === 'GitHub Oauth - token') {
            resolve();
            win.close();
          } else {
            reject();
          }
        });
      });
    }
  });

})();
