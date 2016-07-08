(function () {
  'use strict';

  angular
    .module('app.view.endpoints', [
      'app.view.endpoints.clusters',
      'app.view.endpoints.dashboard',
      'app.view.endpoints.hce'
    ])
    .config(registerRoute)
    .run(register);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoints', {
      url: '/endpoints',
      abstract: true,
      template: '<div ui-view></div>',
      data: {
        activeMenuState: 'endpoints'
      }
    });
  }

  register.$inject = [
    'app.model.modelManager',
    'app.event.eventService'
  ];

  function register(modelManager, eventService) {
    return new Endpoints(modelManager, eventService);
  }

  function Endpoints(modelManager, eventService) {
    var that = this;

    this.modelManager = modelManager;

    eventService.$on(eventService.events.LOGIN, function () {
      that.onLoggedIn();
    });
  }

  angular.extend(Endpoints.prototype, {

    onLoggedIn: function () {
      var menu = this.modelManager.retrieve('app.model.navigation').menu;
      menu.addMenuItem('endpoints', 'endpoints.dashboard', gettext('Endpoints'));
    }

  });

})();
