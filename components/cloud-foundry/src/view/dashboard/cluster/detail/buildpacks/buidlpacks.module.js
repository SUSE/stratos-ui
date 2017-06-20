(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.dashboard.cluster.detail.buildPacks', [])
    .config(registerRoute);

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters.cluster.detail.buildPacks', {
      url: '/buildPacks',
      templateUrl: 'plugins/cloud-foundry/view/dashboard/cluster/detail/buildpacks/buildpacks.html',
      controller: BuildPacksController,
      controllerAs: 'bpCtrl',
      ncyBreadcrumb: {
        label: '{{ clusterController.userServiceInstanceModel.serviceInstances[clusterController.guid].name ||"..." }}',
        parent: function () {
          return 'endpoint.clusters.tiles';
        }
      }
    });
  }

  function BuildPacksController($stateParams, $translate, modelManager) {
    var vm = this;
    vm.guid = $stateParams.guid;
    vm.users = [];
    vm.consoleInfo = modelManager.retrieve('app.model.consoleInfo');
    vm.buildPacksModel = modelManager.retrieve('cloud-foundry.model.buildPacks');

    vm.buildpacks = vm.buildPacksModel.buildPacksByCnsi[vm.guid];
    vm.error = false;
    vm.stateInitialised = !!vm.flags;

    vm.buildPacksModel.fetch(vm.guid).then(function (flags) {
      vm.buildpacks = flags;
    }).catch(function () {
      vm.buildpacks = [];
      vm.error = true;
    }).finally(function () {
      vm.stateInitialised = true;
    });
  }

})();
