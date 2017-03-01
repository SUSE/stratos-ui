(function () {
  'use strict';

  angular
    .module('control-plane.view.metrics.dashboard')
    .directive('networkCard', networkCard);

  networkCard.$inject = ['app.basePath'];

  function networkCard() {
    return {
      bindToController: {
        node: '@',
        metricsNodeName: '@',
        title: '@'
      },
      controller: NetworkCardController,
      controllerAs: 'networkCardCtrl',
      scope: {},
      templateUrl: 'plugins/control-plane/view/metrics/dashboard/data-traffic-summary/network-card/network-card.html'
    };
  }

  NetworkCardController.$inject = [
    '$interval',
    '$state',
    '$scope',
    '$q',
    'app.model.modelManager',
    'app.utils.utilsService'
  ];

  function NetworkCardController($interval, $state, $scope, $q, modelManager, utilsService) {

    this.metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');
    this.$state = $state;
    this.$q = $q;
    this.utilsService = utilsService;
    this.metricsData = {};
    this.cpuLimit = 0;

    this.cardData = {
      title: this.title
    };
  }

  angular.extend(NetworkCardController.prototype, {

    getCardData: function () {
      return this.cardData;
    }
  });

})();
