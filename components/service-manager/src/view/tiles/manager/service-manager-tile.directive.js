(function () {
  'use strict';

  angular
    .module('service-manager.view.tiles')
    .directive('serviceManagerTile', ServiceManagerTile);

  function ServiceManagerTile() {
    return {
      bindToController: {
        service: '='
      },
      controller: ServiceManagerTileController,
      controllerAs: 'tileCtrl',
      scope: {},
      templateUrl: 'plugins/service-manager/view/tiles/manager/service-manager-tile.html'
    };
  }

  /**
   * @name ServiceManagerTileController
   * @constructor
   * @param {object} $scope - the angular $scope service
   * @param {object} $state - the angular $state service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.utils.appUtilsService} appUtilsService - the console appUtilsService service
   */
  function ServiceManagerTileController($scope, $state, modelManager, appUtilsService) {
    var that = this;

    this.$state = $state;
    this.instancesCount = null;
    this.servicesCount = null;
    this.userService = {};

    var cardData = {};
    var expiredStatus = {
      classes: 'danger',
      icon: 'helion-icon-lg helion-icon helion-icon-Critical_S',
      description: gettext('Token has expired')
    };

    var erroredStatus = {
      classes: 'danger',
      icon: 'helion-icon-lg helion-icon helion-icon-Critical_S',
      description: gettext('Cannot contact endpoint')
    };

    cardData.title = this.service.name;
    this.getCardData = function () {
      if (this.userService.error) {
        cardData.status = erroredStatus;
      } else if (that.service.hasExpired) {
        cardData.status = expiredStatus;
      } else {
        delete cardData.status;
      }
      return cardData;
    };

    function init() {
      var userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
      var serviceManagerModel = modelManager.retrieve('service-manager.model');
      $scope.$watch(function () { return that.service; }, function (newVal) {
        if (!newVal) {
          return;
        }
        that.userService = userServiceInstanceModel.serviceInstances[that.service.guid] || {};
        serviceManagerModel.getModel(that.service.guid).then(function (model) {
          that.instancesCount = model.instances.length;
          that.servicesCount = model.services.length;
        });
      });
    }

    appUtilsService.chainStateResolve('sm.tiles', $state, init);
  }

  angular.extend(ServiceManagerTileController.prototype, {

    /**
     * @namespace service-manager.view.tiles
     * @memberof service-manager.view.tiles
     * @name summary
     * @description Navigate to the cluster summary page for this cluster
     */
    summary: function () {
      this.$state.go('sm.endpoint.detail.instances', {guid: this.service.guid});
    }

  });

})();
