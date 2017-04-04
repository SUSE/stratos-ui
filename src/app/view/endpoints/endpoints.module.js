(function () {
  'use strict';

  angular
    .module('app.view.endpoints', [
      'app.view.endpoints.clusters',
      'app.view.endpoints.dashboard'
    ])
    .config(registerRoute)
    .run(register);

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint', {
      url: '/endpoint',
      abstract: true,
      template: '<ui-view/>',
      data: {
        activeMenuState: 'endpoints'
      },
      ncyBreadcrumb: {
        label: gettext('Endpoints')
      }
    });
  }

  function register($q, $state, modelManager, appEventService, appUtilsService) {
    return new Endpoints($q, $state, modelManager, appEventService, appUtilsService);
  }

  function Endpoints($q, $state, modelManager, appEventService, appUtilsService) {
    var that = this;

    this.initialized = $q.defer();

    this.modelManager = modelManager;

    function init() {
      return that.initialized.promise;
    }

    appEventService.$on(appEventService.events.LOGIN, function () {
      that.onLoggedIn();
    });

    appUtilsService.chainStateResolve('endpoint', $state, init);
  }

  angular.extend(Endpoints.prototype, {

    onLoggedIn: function () {
      var menu = this.modelManager.retrieve('app.model.navigation').menu;
      menu.addMenuItem('endpoints', 'endpoint.dashboard', gettext('Endpoints'), 2, 'helion-icon-Inherit helion-icon-r270');
      this.initialized.resolve();
    }

  });

})();
