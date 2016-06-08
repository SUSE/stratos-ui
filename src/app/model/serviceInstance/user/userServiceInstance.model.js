(function () {
  'use strict';

  /**
   * @namespace app.model.serviceInstance.user
   * @memberOf app.model.serviceInstance
   * @name user
   * @description User service instance model
   */
  angular
    .module('app.model')
    .run(registerUserServiceInstanceModel);

  registerUserServiceInstanceModel.$inject = [
    '$q',
    'app.api.apiManager',
    'app.model.modelManager'
  ];

  function registerUserServiceInstanceModel($q, apiManager, modelManager) {
    modelManager.register('app.model.serviceInstance.user', new UserServiceInstance($q, apiManager));
  }

  /**
   * @namespace app.model.serviceInstance.user.UserServiceInstance
   * @memberof app.model.serviceInstance.user
   * @name app.model.serviceInstance.user.UserServiceInstance
   * @param {app.api.apiManager} apiManager - the application API manager
   * @property {app.api.apiManager} apiManager - the application API manager
   * @property {object} serviceInstances - the service instances available to user
   * @property {number} numValid - the number of valid user service instances
   * @class
   */
  function UserServiceInstance($q, apiManager) {
    this.$q = $q;
    this.apiManager = apiManager;
    this.serviceInstances = {};
    this.numValid = 0;
  }

  angular.extend(UserServiceInstance.prototype, {
    /**
     * @function connect
     * @memberof app.api.serviceInstance.user.UserServiceInstance
     * @description Connect a service instance
     * @param {string} guid - the CNSI GUID
     * @param {string} name - the CNSI name
     * @param {string} username - the login username
     * @param {string} password - the login password
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    connect: function (guid, name, username, password) {
      var that = this;
      var serviceInstanceApi = this.apiManager.retrieve('app.api.serviceInstance.user');
      return serviceInstanceApi.connect(guid, username, password)
        .then(function (response) {
          that.onConnect(guid, name, response);
          return response;
        });
    },

    /**
     * @function disconnect
     * @memberof app.model.serviceInstance.user.UserServiceInstance
     * @description Disconnect user from service instance
     * @param {number} id - the service instance ID
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    disconnect: function (id) {
      var serviceInstanceApi = this.apiManager.retrieve('app.api.serviceInstance.user');
      return serviceInstanceApi.disconnect(id);
    },

    /**
     * @function list
     * @memberof app.model.serviceInstance.user.UserServiceInstance
     * @description Returns services instances and number registered
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    list: function () {
      var that = this;
      var serviceInstanceApi = this.apiManager.retrieve('app.api.serviceInstance.user');
      var cfInfoApi = this.apiManager.retrieve('cloud-foundry.api.Info');
      var deferred = this.$q.defer();

      serviceInstanceApi.list()
        .then(function (response) {
          var items = response.data;
          var guids = _.map(items, 'guid') || [];

          that.serviceInstances = {};

          if (_.isEmpty(guids)) {
            deferred.resolve(that.serviceInstances);
          } else {

            var cfg = { headers: { 'x-cnap-cnsi-list': guids.join(',') } };
            // call /v2/info to refresh tokens, then list
            cfInfoApi.GetInfo({}, cfg).then(function () {
              serviceInstanceApi.list().then(function (listResponse) {
                that.onList(listResponse);
                deferred.resolve(that.serviceInstances);
              });
            });
          }
        });

      return deferred.promise;
    },

    /**
     * @function register
     * @memberof app.model.serviceInstance.user.UserServiceInstance
     * @description Set the service instances as registered
     * @param {array} urls - the service instance endpoints
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    register: function (urls) {
      var serviceInstanceApi = this.apiManager.retrieve('app.api.serviceInstance.user');
      return serviceInstanceApi.register(urls);
    },

    /**
     * @function onConnect
     * @memberof app.model.serviceInstance.user.UserServiceInstance
     * @description onConnect handler
     * @param {string} guid - the CNSI GUID
     * @param {string} name - the CNSI name
     * @param {object} response - the HTTP response
     * @returns {void}
     * @private
     */
    onConnect: function (guid, name, response) {
      var newCnsi = response.data;
      newCnsi.guid = guid;
      newCnsi.name = name;
      newCnsi.valid = true;

      if (angular.isUndefined(this.serviceInstances[guid])) {
        this.serviceInstances[guid] = newCnsi;
      } else {
        angular.extend(this.serviceInstances[guid], newCnsi);
      }
    },

    onList: function (response) {
      var items = response.data;

      // check token expirations
      var now = (new Date()).getTime() / 1000;
      angular.forEach(items, function (item) {
        if (!_.isNil(item.token_expiry)) {
          item.valid = item.token_expiry > now;
        }
      });

      this.serviceInstances = _.keyBy(items, 'guid');
      this.numValid = _.sumBy(items, function (o) { return o.valid ? 1 : 0; }) || 0;
    }
  });

})();
