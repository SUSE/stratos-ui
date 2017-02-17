(function () {
  'use strict';

  angular
    .module('control-plane.view.metrics.dashboard.data-traffic-summary', [
      'control-plane.view.metrics.dashboard.data-traffic-summary.cards',
      'control-plane.view.metrics.dashboard.data-traffic-summary.list'
    ])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cp.metrics.dashboard.data-traffic-summary', {
      url: '/data-traffic',
      params: {
        guid: ''
      },
      templateUrl: 'plugins/control-plane/view/metrics/dashboard/data-traffic-summary/data-traffic-summary.html',
      controller: DataTrafficSummaryController,
      controllerAs: 'dataTrafficSummaryCtrl'
    });
  }


  DataTrafficSummaryController.$inject = [
    '$q',
    '$state',
    '$stateParams',
    'app.model.modelManager',
    'app.utils.utilsService',
    'control-plane.metrics.metrics-data-service'
  ];

  function DataTrafficSummaryController($q, $state, $stateParams, modelManager, utilsService, metricsDataService) {
    var that = this;
    this.model = modelManager.retrieve('cloud-foundry.model.application');

    var metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');
    var controlPlaneModel = modelManager.retrieve('control-plane.model');
    this.utilsService = utilsService;
    this.guid = $stateParams.guid;

    this.totalNetworkUsage = gettext('Total Network Traffic');

    function init() {
      return $q.resolve();
    }

    utilsService.chainStateResolve('cp.metrics.dashboard.data-traffic-summary', $state, init);

  }

  angular.extend(DataTrafficSummaryController.prototype, {});

})();
