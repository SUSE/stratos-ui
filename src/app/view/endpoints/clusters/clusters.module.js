(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters', [
      'app.view.endpoints.clusters.cluster',
      'app.view.endpoints.clusters.tiles',
      'app.view.endpoints.clusters.router'
    ])
    .config(registerRoute)
    .run(register);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters', {
      url: '/cluster',
      abstract: true,
      template: '<ui-view/>',
      data: {
        activeMenuState: 'endpoint.clusters'
      }
    });
  }

  register.$inject = [
    '$q',
    '$state',
    'modelManager',
    'appEventService',
    'appUtilsService'
  ];

  function register($q, $state, modelManager, appEventService, utils) {
    return new Clusters($q, $state, modelManager, appEventService, utils);
  }

  function Clusters($q, $state, modelManager, appEventService, utils) {
    var that = this;

    this.initialized = $q.defer();

    this.modelManager = modelManager;

    function init() {
      return that.initialized.promise;
    }

    appEventService.$on(appEventService.events.LOGIN, function () {
      that.onLoggedIn();
    });

    utils.chainStateResolve('endpoint.clusters', $state, init);
  }

  angular.extend(Clusters.prototype, {

    onLoggedIn: function () {
      var menu = this.modelManager.retrieve('app.model.navigation').menu;
      menu.addMenuItem('endpoint.clusters', 'endpoint.clusters.router', 'menu.cloud-foundry', 1, 'helion-icon-Cloud');
      this.initialized.resolve();
    }
  });

})();
