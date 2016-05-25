(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model.private-domain
   * @memberOf cloud-foundry.model
   * @description PrivateDomain model
   */
  angular
    .module('cloud-foundry.model')
    .run(registerPrivateDomainModel);

  registerPrivateDomainModel.$inject = [
    'app.model.modelManager',
    'app.api.apiManager'
  ];

  function registerPrivateDomainModel(modelManager, apiManager) {
    modelManager.register('cloud-foundry.model.private-domain', new PrivateDomain(apiManager));
  }

  /**
   * @namespace cloud-foundry.model.private-domain.PrivateDomain
   * @memberOf cloud-foundry.model.private-domain
   * @name cloud-foundry.model.domain.PrivateDomain
   * @param {app.api.apiManager} apiManager - the private-domain API manager
   * @property {app.api.apiManager} apiManager - the private-domain API manager
   * @class
   */
  function PrivateDomain(apiManager) {
    this.apiManager = apiManager;
  }

  angular.extend(PrivateDomain.prototype, {
    /**
     * @function listAllPrivateDomains
     * @memberof cloud-foundry.model.private-domain
     * @description list all private domains
     * @param {object} params - optional parameters
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    listAllPrivateDomains: function (params) {
      return this.apiManager.retrieve('cloud-foundry.api.PrivateDomains')
        .ListAllPrivateDomains(params)
        .then(function (response) {
          return response.data.resources;
        });
    }
  });

})();
