(function () {
  'use strict';

  angular
    .module('app.view')
    .directive('serviceRegistration', serviceRegistration);

  serviceRegistration.$inject = ['app.basePath'];

  /**
   * @namespace app.view.serviceRegistration
   * @memberof app.view
   * @name serviceRegistration
   * @description A service-registration directive
   * @param {string} path - the application base path
   * @returns {object} The service-registration directive definition object
   */
  function serviceRegistration (path) {
    return {
      bindToController: {
        showOverlayRegistration: '=?'
      },
      controller: ServiceRegistrationController,
      controllerAs: 'serviceRegistrationCtrl',
      scope: {},
      templateUrl: path + 'view/service-registration/service-registration.html'
    };
  }

  ServiceRegistrationController.$inject = [
    '$scope',
    'app.model.modelManager',
    'app.api.apiManager',
    'app.view.hceRegistration',
    'app.view.hcfRegistration'

  ];

  /**
   * @namespace app.view.ServiceRegistrationController
   * @memberof app.view
   * @name ServiceRegistrationController
   * @constructor
   * @param {object} $scope - the Angular $scope service
   * @param {app.model.modelManager} modelManager - the application model manager
   * @param {app.api.apiManager} apiManager - the application API manager
   * @param {app.view.hceRegistration} hceRegistration  HCE Registration service
   * @param {app.view.hcfRegistration}  hcfRegistration   HCF Registration service
   * @property {boolean} overlay - flag to show or hide this component
   * @property {app.model.serviceInstance} serviceInstanceModel - the service instance model
   * @property {array} serviceInstances - the service instances available to user
   * @property {string} warningMsg - the warning message to show if expired
   */
  function ServiceRegistrationController ($scope, modelManager, apiManager, hceRegistration, hcfRegistration) {
    var that = this;
    this.overlay = angular.isDefined(this.showOverlayRegistration);
    this.clusterAddFlyoutActive = false;
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.serviceInstances = {};
    this.serviceInstanceApi = apiManager.retrieve('app.api.serviceInstance');
    this.credentialsFormOpen = false;
    this.warningMsg = gettext('Authentication failed, please try reconnect.');
    this.hceRegistration = hceRegistration;
    this.hcfRegistration = hcfRegistration;
    this.currentEndpoints = [];
    /* eslint-disable */
    // TODO(woodnt): There must be a more reproducable/general way of doing this. https://jira.hpcloud.net/browse/TEAMFOUR-626
    /* eslint-enable */
    this.cfModel = modelManager.retrieve('cloud-foundry.model.application');
    this.currentUserAccount = modelManager.retrieve('app.model.account');

    $scope.$watchCollection(function () {
      return that.cnsiModel.serviceInstances;
    }, function (newCnsis) {
      _.forEach(newCnsis, function (cnsi) {
        var guid = cnsi.guid;
        if (angular.isUndefined(that.serviceInstances[guid])) {
          that.serviceInstances[guid] = cnsi;
        } else {
          angular.extend(that.serviceInstances[guid], cnsi);
        }
      });
    });

    $scope.$watchCollection(function () {
      return that.serviceInstances;
    }, function (newCnsis) {
      that.currentEndpoints = _.map(newCnsis,
        function (c) {
          var endpoint = c.api_endpoint;
          return endpoint.Scheme + '://' + endpoint.Host;
        });
    });

    this.userCnsiModel.list().then(function () {
      angular.extend(that.serviceInstances, that.userCnsiModel.serviceInstances);
      that.cnsiModel.list();
    });
  }

  angular.extend(ServiceRegistrationController.prototype, {
    /**
     * @function completeRegistration
     * @memberOf app.view.ServiceRegistrationController
     * @description Set service instances as registered
     */
    completeRegistration: function () {
      var that = this;
      if (this.userCnsiModel.numValid > 0) {
        that.showOverlayRegistration = false;
      }
    },

    /**
     * @function connect
     * @memberOf app.view.ServiceRegistrationController
     * @description Connect service instance for user
     * @param {object} serviceInstance - the service instance to connect
     */
    connect: function (serviceInstance) {
      this.activeServiceInstance = serviceInstance;
      this.credentialsFormOpen = true;
    },

    /**
     * @function disconnect
     * @memberOf app.view.ServiceRegistrationController
     * @description Disconnect service instance for user
     * @param {object} userServiceInstance - the model user version of the service instance to disconnect
     */
    disconnect: function (userServiceInstance) {
      var that = this;

      // Our mocking system uses "id" but the real systems use "guid".
      // This bandaid will allow the use of either.
      var id = angular.isUndefined(userServiceInstance.guid) ? userServiceInstance.id : userServiceInstance.guid;

      this.userCnsiModel.disconnect(id)
        .then(function success () {
          delete userServiceInstance.account;
          delete userServiceInstance.token_expiry;
          delete userServiceInstance.valid;
          that.userCnsiModel.numValid -= 1;
          that.cfModel.all();
        });
    },

    onConnectCancel: function () {
      this.credentialsFormOpen = false;
    },

    onConnectSuccess: function () {
      this.userCnsiModel.numValid += 1;
      this.credentialsFormOpen = false;
      this.activeServiceInstance = null;
    },

    remove: function (serviceInstance) {
      var that = this;
      this.cnsiModel.remove(serviceInstance)
        .then(function success () {
          that.serviceInstances = {};
          that.userCnsiModel.list().then(function () {
            angular.extend(that.serviceInstances, that.userCnsiModel.serviceInstances);
            that.cnsiModel.list();
          });
        });
    },

    /**
     * @function showClusterAddForm
     * @memberOf app.view.ServiceRegistrationController
     * @description Show the cluster add form flyout
     */
    showClusterAddForm: function () {
      this.hcfRegistration.add();
    },

    /**
     * @function showHCEEndpointAddForm
     * @memberOf app.view.ServiceRegistrationController
     * @description Show the HCE Endpoint add form detail view
     */
    showHCEEndpointAddForm: function () {
      this.hceRegistration.add();
    },

    isAdmin: function () {
      return this.currentUserAccount.isAdmin();
    },

    /**
     * @function overrideIsAdmin
     * @memberOf app.view.ServiceRegistrationController
     * @description Set the admin override
     * @param {Bool} isDeveloper true when user is developer
     */
    overrideIsAdmin: function (isDeveloper) {
      this.currentUserAccount.setAdminOverride(isDeveloper);
    }

  });

})();
