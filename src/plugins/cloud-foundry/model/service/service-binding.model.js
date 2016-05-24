(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model.service-binding
   * @memberOf cloud-foundry.model
   * @name serviceBinding
   * @description Service binding model
   */
  angular
    .module('cloud-foundry.model')
    .run(registerServiceBindingModel);

  registerServiceBindingModel.$inject = [
    'app.model.modelManager',
    'app.api.apiManager'
  ];

  function registerServiceBindingModel(modelManager, apiManager) {
    modelManager.register('cloud-foundry.model.service-binding', new ServiceBinding(apiManager));
  }

  /**
   * @memberof cloud-foundry.model.serviceBinding
   * @namespace cloud-foundry.model.serviceBinding
   * @name ServiceBinding
   * @param {app.api.apiManager} apiManager - the API manager
   * @property {app.api.apiManager} apiManager - the API manager
   * @class
   */
  function ServiceBinding(apiManager) {
    this.apiManager = apiManager;
  }

  angular.extend(ServiceBinding.prototype, {

    /**
     * @function deleteServiceBinding
     * @memberof  cloud-foundry.model.serviceBinding
     * @description delete a particular service binding
     * @param {string} guid - the service binding id
     * @param {object} params - params for url building
     * @returns {promise} A promise object
     * @public
     **/
    deleteServiceBinding: function (guid, params) {
      return this.apiManager.retrieve('cloud-foundry.api.ServiceBindings')
        .DeleteServiceBinding(guid, params);
    },

    /**
     * @function listAllServiceBindings
     * @memberof  cloud-foundry.model.serviceBinding
     * @description list all service bindings
     * @param {object} params - params for url building
     * @returns {promise} A promise object
     * @public
     **/
    listAllServiceBindings: function (params) {
      return this.apiManager.retrieve('cloud-foundry.api.ServiceBindings')
        .ListAllServiceBindings(params)
        .then(function (response) {
          return response.data.resources;
        });
    }
  });

})();
