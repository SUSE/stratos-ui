(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model.service
   * @memberOf cloud-foundry.model
   * @name service
   * @description Service model
   */
  angular
    .module('cloud-foundry.model')
    .run(registerServiceModel);

  registerServiceModel.$inject = [
    'app.model.modelManager',
    'app.api.apiManager',
    'cloud-foundry.model.modelUtils'
  ];

  function registerServiceModel(modelManager, apiManager, modelUtils) {
    modelManager.register('cloud-foundry.model.service', new Service(apiManager, modelUtils));
  }

  /**
   * @memberof cloud-foundry.model.service
   * @name Service
   * @param {app.api.apiManager} apiManager - the service API manager
   * @param {cloud-foundry.model.modelUtils} modelUtils - a service containing general hcf model helpers
   * @property {app.api.apiManager} apiManager - the service API manager
   * @property {cloud-foundry.model.modelUtils} modelUtils - service containing general hcf model helpers
   * @property {app.api.servicePlanApi} serviceApi - the service API proxy
   * @class
   */
  function Service(apiManager, modelUtils) {
    this.apiManager = apiManager;
    this.serviceApi = this.apiManager.retrieve('cloud-foundry.api.Services');
    this.modelUtils = modelUtils;
    this.data = {};
  }

  angular.extend(Service.prototype, {
    /**
     * @function all
     * @memberof  cloud-foundry.model.service
     * @description List all services at the model layer
     * @param {string} cnsiGuid - The GUID of the cloud-foundry server.
     * @param {object} options - options for url building
     * @returns {promise} A promise object
     * @public
     **/
    all: function (cnsiGuid, options) {
      var that = this;
      return this.serviceApi.ListAllServices(options)
        .then(function (response) {
          return that.onAll(response.data[cnsiGuid]);
        });
    },

    /**
     * @function allServicePlans
     * @memberof cloud-foundry.model.service
     * @description LIst all service plans for service
     * @param {string} cnsiGuid - the CNSI guid
     * @param {string} guid - the service guid
     * @param {object} options - additional parameters for request
     * @returns {promise} A promise object
     * @public
     */
    allServicePlans: function (cnsiGuid, guid, options) {
      var that = this;
      var httpConfig = {
        headers: { 'x-cnap-cnsi-list': cnsiGuid }
      };
      return this.serviceApi.ListAllServicePlansForService(guid, options, httpConfig)
        .then(function (response) {
          return that.onAllServicePlans(response.data[cnsiGuid]);
        });
    },

    /**
     * @function retrieveService
     * @memberof cloud-foundry.model.service
     * @description Retrieve a sinble service
     * @param {string} cnsiGuid - the CNSI guid
     * @param {string} guid - the service guid
     * @param {object} options - additional parameters for request
     * @returns {promise} A promise object
     * @public
     */
    retrieveService: function (cnsiGuid, guid, options) {
      return this.serviceApi.RetrieveService(guid, options, this.modelUtils.makeHttpConfig(cnsiGuid))
        .then(function (response) {
          return response.data;
        });
    },

    /**
     * @function onAll
     * @memberof cloud-foundry.model.service
     * @description onAll handler at model layer
     * @param {string} response - the json return from the api call
     * @returns {object} The response
     * @private
     */
    onAll: function (response) {
      this.data = response.resources;
      return response.resources;
    },

    /**
     * @function onAllServicePlans
     * @memberof cloud-foundry.model.service
     * @description onAllServicePlans handler at model layer
     * @param {string} response - the JSON returned from API call
     * @returns {object} The response
     * @private
     */
    onAllServicePlans: function (response) {
      this.data.servicePlans = response.resources;
      return response.resources;
    }
  });

})();
