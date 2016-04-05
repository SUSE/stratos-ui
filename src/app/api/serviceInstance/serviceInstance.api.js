(function () {
  'use strict';

  /**
   * @namespace app.api.serviceInstance
   * @memberof app.api
   * @name serviceInstance
   * @description Service instance API
   */
  angular
    .module('app.api')
    .run(registerServiceInstanceApi);

  registerServiceInstanceApi.$inject = [
    '$http',
    'app.api.apiManager'
  ];

  function registerServiceInstanceApi($http, apiManager) {
    apiManager.register('app.api.serviceInstance', new ServiceInstanceApi($http));
  }

  /**
   * @namespace app.api.serviceInstance.ServiceInstanceApi
   * @memberof app.api.serviceInstance
   * @name ServiceInstanceApi
   * @param {object} $http - the Angular $http service
   * @property {object} $http - the Angular $http service
   * @class
   */
  function ServiceInstanceApi($http) {
    this.$http = $http;
  }

  angular.extend(ServiceInstanceApi.prototype, {
    /**
     * @function create
     * @memberof app.api.serviceInstance.ServiceInstanceApi
     * @description Create a service instance
     * @param {string} url - the service instance endpoint
     * @param {string} name - the service instance friendly name
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    create: function (url, name) {
      return this.$http.post('/api/service-instances', { url: url, name: name });
    },

    /**
     * @function remove
     * @memberof app.api.serviceInstance.ServiceInstanceApi
     * @description Remove service instance
     * @param {number} id - the ID of the service instance to remove
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    remove: function (id) {
      return this.$http.delete('/api/service-instances/' + id);
    },

    /**
     * @function list
     * @memberof app.api.serviceInstance.ServiceInstanceApi
     * @description Returns a list of service instances (master list)
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    list: function () {
      return this.$http.get('/api/service-instances');
    }
  });

})();
