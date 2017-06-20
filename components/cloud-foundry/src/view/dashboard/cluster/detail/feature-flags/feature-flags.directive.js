(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.dashboard.cluster.detail.featureFlags', [])
    .config(registerRoute);

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters.cluster.detail.featureFlags', {
      url: '/featureFlags',
      templateUrl: 'plugins/cloud-foundry/view/dashboard/cluster/detail/feature-flags/feature-flags.html',
      controller: FeatureFlagsController,
      controllerAs: 'ffCtrl',
      ncyBreadcrumb: {
        label: '{{ clusterController.userServiceInstanceModel.serviceInstances[clusterController.guid].name ||"..." }}',
        parent: function () {
          return 'endpoint.clusters.tiles';
        }
      }
    });
  }

  function FeatureFlagsController($stateParams, $translate, modelManager) {
    var vm = this;
    vm.guid = $stateParams.guid;
    vm.users = [];
    vm.consoleInfo = modelManager.retrieve('app.model.consoleInfo');
    vm.featureFlagsModel = modelManager.retrieve('cloud-foundry.model.featureFlags');

    // The feature flags metadata will normally have been loaded already
    vm.flags = vm.featureFlagsModel.featureFlagsByCnsi[vm.guid];
    addDescription();
    vm.error = false;
    vm.stateInitialised = !!vm.flags;

    vm.featureFlagsModel.fetch(vm.guid).then(function (flags) {
      vm.flags = flags;
      addDescription();
    }).catch(function () {
      vm.flags = [];
      vm.error = true;
    }).finally(function () {
      vm.stateInitialised = true;
    });

    function addDescription() {
      _.each(vm.flags, function (flag) {
        flag.description = $translate.instant('cf.feature-flags.descriptions.' + flag.name);
      });
    }
  }

})();
