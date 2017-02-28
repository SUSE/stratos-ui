(function () {
  'use strict';

  angular
    .module('control-plane.view.metrics.dashboard.cpu-summary.cards', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cp.metrics.dashboard.cpu-summary.cards', {
      url: '/tiles',
      params: {
        guid: ''
      },
      controller: CardsViewController,
      controllerAs: 'cardsViewCtrl',
      scope: {},
      templateUrl: 'plugins/control-plane/view/metrics/dashboard/cpu-summary/cpu-cards-view/cpu-cards-view.html',
      ncyBreadcrumb: {
        skip: true
      }
    });
  }

  CardsViewController.$inject = [
    '$q',
    '$state',
    '$stateParams',
    'app.utils.utilsService',
    'control-plane.metrics.metrics-data-service'
  ];

  function CardsViewController($q, $state, $stateParams, utilsService, metricsDataService) {

    var that = this;
    this.guid = $stateParams.guid;
    this.nodes = [];
    function init() {
      that.nodes = metricsDataService.getNodes(that.guid);

      return $q.resolve();
    }

    utilsService.chainStateResolve('cp.metrics.dashboard.summary.cards', $state, init);

  }

  angular.extend(CardsViewController.prototype, {});

})();
