(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster.organization.space', [
      'app.view.endpoints.clusters.cluster.organization.space.detail'
    ])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters.cluster.organization.space', {
      url: '/space/:space',
      abstract: true,
      template: '<ui-view/>',
      controller: ClusterSpaceController,
      controllerAs: 'clusterSpaceController'
    });
  }

  ClusterSpaceController.$inject = [
    '$state',
    '$stateParams'
  ];

  function ClusterSpaceController($state, $stateParams) {
    $state.current.data.spaceGuid = $stateParams.space;
  }

  angular.extend(ClusterSpaceController.prototype, {});
})();
