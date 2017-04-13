(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.tiles')
    .directive('clusterTile', ClusterTile);

  function ClusterTile() {
    return {
      bindToController: {
        service: '=',
        connect: '=',
        disconnect: '=',
        unregister: '='
      },
      controller: ClusterTileController,
      controllerAs: 'clusterTile',
      scope: {},
      templateUrl: 'app/view/endpoints/clusters/tiles/cluster-tile/cluster-tile.html'
    };
  }

  /**
   * @name ClusterTileController
   * @constructor
   * @param {object} $scope - the angular $scope service
   * @param {object} $state - the angular $state service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.api.apiManager} apiManager - the API management service
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {cloud-foundry.model.modelUtils} modelUtils - service containing general hcf model helpers
   * @property {Array} actions - collection of relevant actions that can be executed against cluster
   * @property {number} orgCount - organisation count
   * @property {number} userCount - user count
   * @property {object} cardData - gallery-card directive data object
   * @property {cloud-foundry.model.modelUtils} modelUtils - service containing general hcf model helpers
   */
  function ClusterTileController($scope, $state, modelManager, apiManager, appUtilsService, modelUtils) {
    var vm = this;

    vm.stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');
    vm.orgCount = null;
    vm.userCount = null;
    vm.userService = {};
    vm.getCardData = getCardData;
    vm.summary = summary;
    vm.setUserCount = setUserCount;
    vm.setOrganisationCount = setOrganisationCount;

    // Need to fetch the total number of organizations and users. To avoid fetching all items, only fetch 1 and read
    // list metadata total_results. In order to do this we must go via the api, not the model.
    var userApi = apiManager.retrieve('cloud-foundry.api.Users');
    var organizationApi = apiManager.retrieve('cloud-foundry.api.Organizations');
    var userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
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

    cardData.title = vm.service.name;

    // Ensure the parent state is fully initialised before we start our own init
    appUtilsService.chainStateResolve('endpoint.clusters.tiles', $state, init);

    function getCardData() {
      if (vm.userService.error) {
        cardData.status = erroredStatus;
      } else if (vm.service.hasExpired) {
        cardData.status = expiredStatus;
      } else {
        delete cardData.status;
      }
      return cardData;
    }

    /**
     * @namespace app.view.endpoints.clusters
     * @memberof app.view.endpoints.clusters
     * @name setUserCount
     * @description Determine the number of users associated with this cluster
     */
    function setUserCount() {
      vm.userCount = 0;

      if (!vm.service.isConnected || vm.userService.error ||
        !vm.stackatoInfo.info.endpoints.hcf[vm.service.guid].user.admin) {
        vm.userCount = undefined;
        return;
      }

      userApi.ListAllUsers({'results-per-page': 1}, modelUtils.makeHttpConfig(vm.service.guid))
        .then(function (response) {
          vm.userCount = response.data.total_results;
        })
        .catch(function () {
          vm.userCount = undefined;
        });
    }

    /**
     * @namespace app.view.endpoints.clusters
     * @memberof app.view.endpoints.clusters
     * @name setOrganisationCount
     * @description Determine the number of organisations associated with this cluster
     */
    function setOrganisationCount() {
      vm.orgCount = 0;

      if (!vm.service.isConnected || vm.userService.error) {
        vm.orgCount = undefined;
        return;
      }
      organizationApi.ListAllOrganizations({'results-per-page': 1},
        modelUtils.makeHttpConfig(vm.service.guid))
        .then(function (response) {
          vm.orgCount = response.data.total_results;
        })
        .catch(function () {
          vm.orgCount = undefined;
        });
    }

    function init() {
      $scope.$watch(function () { return vm.service; }, function (newVal) {
        if (!newVal) {
          return;
        }
        vm.userService = userServiceInstanceModel.serviceInstances[vm.service.guid] || {};
        setOrganisationCount();
        setUserCount();
      });
    }

    /**
     * @namespace app.view.endpoints.clusters
     * @memberof app.view.endpoints.clusters
     * @name summary
     * @description Navigate to the cluster summary page for this cluster
     */
    function summary() {
      $state.go('endpoint.clusters.cluster.detail.organizations', {guid: vm.service.guid, orgCount: vm.orgCount, userCount: vm.userCount});
    }

  }

})();
