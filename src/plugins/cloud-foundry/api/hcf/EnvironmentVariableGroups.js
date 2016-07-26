/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  registerApi.$inject = [
    '$http',
    'app.api.apiManager'
  ];

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.EnvironmentVariableGroups', new EnvironmentVariableGroupsApi($http));
  }

  function EnvironmentVariableGroupsApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(EnvironmentVariableGroupsApi.prototype, {

   /*
    * Getting the contents of the running environment variable group
    * returns the set of default environment variables available to running apps
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/environment_variable_groups/getting_the_contents_of_the_running_environment_variable_group.html
    */
    GettingContentsOfRunningEnvironmentVariableGroup: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/config/environment_variable_groups/running';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

   /*
    * Getting the contents of the staging environment variable group
    * returns the set of default environment variables available during staging
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/environment_variable_groups/getting_the_contents_of_the_staging_environment_variable_group.html
    */
    GettingContentsOfStagingEnvironmentVariableGroup: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/config/environment_variable_groups/staging';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

   /*
    * Updating the contents of the running environment variable group
    * Updates the set of environment variables which will be made available to all running apps
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/environment_variable_groups/updating_the_contents_of_the_running_environment_variable_group.html
    */
    UpdateContentsOfRunningEnvironmentVariableGroup: function (value, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/config/environment_variable_groups/running';
      config.method = 'PUT';
      config.data = value;

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

   /*
    * Updating the contents of the staging environment variable group
    * Updates the set of environment variables which will be made available during staging
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/environment_variable_groups/updating_the_contents_of_the_staging_environment_variable_group.html
    */
    UpdateContentsOfStagingEnvironmentVariableGroup: function (value, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/config/environment_variable_groups/staging';
      config.method = 'PUT';
      config.data = value;

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    }

  });
  /* eslint-enable camelcase */

})();
