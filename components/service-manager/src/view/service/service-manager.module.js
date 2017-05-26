(function () {
  'use strict';

  angular
    .module('service-manager.view.service', [
      'service-manager.view.service.detail',
      'service-manager.view.service.detail.instances',
      'service-manager.view.service.detail.services',
      'service-manager.view.service.sdl-detail'
    ])
    .config(registerRoute);

  function registerRoute($stateProvider) {
    $stateProvider.state('sm.endpoint', {
      url: '/:guid',
      abstract: true,
      template: '<ui-view/>',
      controller: ServiceManagerController,
      controllerAs: 'smCtrl'
    });
  }

  ServiceManagerController.$inject = [
    '$stateParams',
    '$state',
    'appUtilsService',
    'modelManager',
    'service-manager.view.manage-instance.dialog'
  ];

  function ServiceManagerController($stateParams, $state, appUtilsService, modelManager, manageInstanceDialog) {
    var that = this;

    this.initialized = false;
    this.guid = $stateParams.guid;
    this.$state = $state;
    this.manageInstanceDialog = manageInstanceDialog;

    this.getEndpoint = function () {
      return appUtilsService.getClusterEndpoint(that.endpoint);
    };

    function init() {
      that.userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
      that.hsmModel = modelManager.retrieve('service-manager.model');
      that.consoleInfo = modelManager.retrieve('app.model.consoleInfo');

      return that.consoleInfo.getConsoleInfo().then(function (info) {
        that.endpoint = info.endpoints.hsm[that.guid];

        return that.hsmModel.getModel(that.guid).then(function (model) {
          that.model = model;
        });
      });
    }

    appUtilsService.chainStateResolve('sm.endpoint', $state, init);
  }

  angular.extend(ServiceManagerController.prototype, {

    hasUpgrade: function (instanceId, noIgnore) {
      return noIgnore ? this.hsmModel.hasUpgradeAvailable(this.guid, instanceId) : this.hsmModel.hasUpgrade(this.guid, instanceId);
    },

    endpointHasUpgrades: function () {
      return this.hsmModel.endpointHasUpgrades(this.guid);
    },

    createInstance: function (serviceId, productVersion, sdlVersion) {
      var that = this;

      that.manageInstanceDialog.show('create', that.guid, _.keyBy(that.hsmModel.model[that.guid].services, 'id'),
        serviceId, productVersion, sdlVersion).result
        .then(function (instance) {
          // Open the instance once it has been created
          that.$state.go('sm.endpoint.instance.components', {guid: that.guid, id: instance.instance_id});
        });
    },

    acknowledgeUpgrade: function (instanceId) {
      this.hsmModel.clearUpgrades(this.guid, instanceId);
    }
  });

})();
