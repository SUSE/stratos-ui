/* DO NOT EDIT: This code has been generated by the cf-dotnet-sdk-builder */

(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.AppUsageEvents', new AppUsageEventsApi($http));
  }

  function AppUsageEventsApi($http) {
    this.$http = $http;
  }

  /* eslint-disable camelcase */
  angular.extend(AppUsageEventsApi.prototype, {

   /*
    * List all App Usage Events
    * Events are sorted by internal database IDs. This order may differ from created_at.
    * Events close to the current time should not be processed because other events may still have open
    * transactions that will change their order in the results.
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/app_usage_events/list_all_app_usage_events.html
    */
    ListAllAppUsageEvents: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/app_usage_events';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

   /*
    * Purge and reseed App Usage Events
    * Destroys all existing events. Populates new usage events, one for each started app.
    * All populated events will have a created_at value of current time.
    * There is the potential race condition if apps are currently being started, stopped, or scaled.
    * The seeded usage events will have the same guid as the app.
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/app_usage_events/purge_and_reseed_app_usage_events.html
    */
    PurgeAndReseedAppUsageEvents: function (params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/app_usage_events/destructively_purge_all_and_reseed_started_apps';
      config.method = 'POST';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    },

   /*
    * Retrieve a Particular App Usage Event
    * For detailed information, see online documentation at: http://apidocs.cloudfoundry.org/237/app_usage_events/retrieve_a_particular_app_usage_event.html
    */
    RetrieveAppUsageEvent: function (guid, params, httpConfigOptions) {
      var config = {};
      config.params = params;
      config.url = '/pp/v1/proxy/v2/app_usage_events/' + guid + '';
      config.method = 'GET';

      for (var option in httpConfigOptions) {
        if (!httpConfigOptions.hasOwnProperty(option)) { continue; }
        config[option] = httpConfigOptions[option];
      }
      return this.$http(config);
    }

  });
  /* eslint-enable camelcase */

})();
