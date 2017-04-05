/* DO NOT EDIT: This code has been generated by swagger-codegen */
(function () {
  'use strict';

  angular
    .module('cloud-foundry.api')
    .run(registerApi);

  function registerApi($http, apiManager) {
    apiManager.register('cloud-foundry.api.HcePipelineApi', new HcePipelineApi($http));
  }

  /**
    * @constructor
    * @name HcePipelineApi
    * @description For more information on this API, please see:
    * https://github.com/hpcloud/hce-rest-service/blob/master/app/v2/swagger.yml
    * @param {object} $http - the Angular $http service
    * @property {object} $http - the Angular $http service
    * @property {string} baseUrl - the API base URL
    */
  function HcePipelineApi($http) {
    this.$http = $http;
    this.baseUrl = '/pp/v1/proxy/v2';
  }

  angular.extend(HcePipelineApi.prototype, {
    /**
     * @name deletePipelineExecution
     * @description Delete the specified build.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} executionId - Build id.
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    deletePipelineExecution: function (guid, executionId, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/executions/{execution_id}'
        .replace('{' + 'execution_id' + '}', executionId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'DELETE',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getPipelineEvent
     * @description Get the specified pipeline event.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} eventId - PipelineEvent id.
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getPipelineEvent: function (guid, eventId, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/events/{event_id}'
        .replace('{' + 'event_id' + '}', eventId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getPipelineEvents
     * @description List pipeline events, optionally filtering by Build id.
     * @param {string} guid - the HCE instance GUID
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getPipelineEvents: function (guid, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/events';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getPipelineExecution
     * @description Gets the specified build.
     * @param {string} guid - the HCE instance GUID
     * @param {!number} executionId - Build id.
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getPipelineExecution: function (guid, executionId, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/executions/{execution_id}'
        .replace('{' + 'execution_id' + '}', executionId);
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name getPipelineExecutions
     * @description List executions, optionally filtering by project_id.
     * @param {string} guid - the HCE instance GUID
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    getPipelineExecutions: function (guid, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/executions';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'GET',
        url: path,
        params: params || {},
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name pipelineEventOccurred
     * @description Record a PipelineEvent.
     * @param {string} guid - the HCE instance GUID
     * @param {object} data - the request body
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    pipelineEventOccurred: function (guid, data, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/events';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'POST',
        url: path,
        params: params || {},
        data: data,
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    },

    /**
     * @name triggerPipelineExecution
     * @description Trigger execution of a pipeline(s).
     * @param {string} guid - the HCE instance GUID
     * @param {object} data - the request body
     * @param {object} params - the query parameters
     * @param {object} httpConfigOptions - additional config options
     * @returns {promise} A resolved/rejected promise
     */
    triggerPipelineExecution: function (guid, data, params, httpConfigOptions) {
      var path = this.baseUrl + '/pipelines/triggers';
      var headers = {
        'x-cnap-cnsi-list': guid
      };

      var config = {
        method: 'POST',
        url: path,
        params: params || {},
        data: data,
        headers: headers
      };

      angular.forEach(httpConfigOptions, function (optionConfig, option) {
        if (option === 'headers') {
          angular.extend(config[option], optionConfig);
        } else {
          config[option] = optionConfig;
        }
      });

      return this.$http(config);
    }
  });
})();
