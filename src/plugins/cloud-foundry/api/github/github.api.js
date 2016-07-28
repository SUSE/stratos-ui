(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.api.github
   * @memberOf cloud-foundry.api
   * @name github
   * @description Github API
   */
  angular
    .module('cloud-foundry.api')
    .run(registerGithubApi);

  registerGithubApi.$inject = [
    '$http',
    '$window',
    'app.api.apiManager'
  ];

  function registerGithubApi($http, $window, apiManager) {
    apiManager.register('cloud-foundry.api.github', new GithubApi($http, $window));
  }

  /**
   * @memberof cloud-foundry.api.github
   * @name GithubApi
   * @param {object} $http - the Angular $http service
   * @param {object} $window - the Angular $window service
   * @property {object} $http - the Angular $http service
   * @property {string} githubApiUrl - the Github API endpoint
   * @property {boolean} authenticated - user has authenticated with Github
   * @class
   */
  function GithubApi($http, $window) {
    this.$http = $http;
    this.githubApiUrl = '/pp/v1/github/';
    this.authenticated = false;

    var that = this;
    $window.addEventListener('message', function (event) {
      var message = angular.fromJson(event.data);
      if (message.name === 'GitHub Oauth - token') {
        that.authenticated = true;
      }
    });
  }

  angular.extend(GithubApi.prototype, {
   /**
    * @function repos
    * @memberof cloud-foundry.api.github.GithubApi
    * @description Get repos user owns or has admin rights to
    * @param {object} params - additional params to send
    * @returns {promise}
    * @public
    */
    repos: function (params) {
      var url = this.githubApiUrl + 'user/repos';
      var config = {
        params: params || {},
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      };

      return this.$http.get(url, config);
    },

    /**
    * @function branches
    * @memberof cloud-foundry.api.github.GithubApi
    * @description Get branches a repo
    * @param {string} repo - the repo full name
    * @param {object} params - additional params to send
    * @returns {promise}
    * @public
    */
    branches: function (repo, params) {
      var url = this.githubApiUrl + 'repos/' + repo + '/branches';
      var config = {
        params: params || {},
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      };

      return this.$http.get(url, config);
    },

    /**
     * @function getBranch
     * @memberof cloud-foundry.api.github.GithubApi
     * @description Get specified branch
     * @param {string} repo - the repo full name
     * @param {string} branch - the branch name
     * @param {object} params - additional params to send
     * @returns {promise}
     * @public
     */
    getBranch: function (repo, branch, params) {
      var url = this.githubApiUrl + 'repos/' + repo + '/branches/' + branch;
      var config = {
        params: params || {},
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      };

      return this.$http.get(url, config);
    },

    /**
    * @function commits
    * @memberof cloud-foundry.api.github.GithubApi
    * @description Get commits for a repo
    * @param {string} repo - the repo full name
    * @param {object} params - additional params to send
    * @returns {promise}
    * @public
    */
    commits: function (repo, params) {
      var url = this.githubApiUrl + 'repos/' + repo + '/commits';
      var config = {
        params: params || {},
        headers: {
          Accept: 'application/vnd.github.v3+json'
        }
      };
      return this.$http.get(url, config);
    }
  });

})();
