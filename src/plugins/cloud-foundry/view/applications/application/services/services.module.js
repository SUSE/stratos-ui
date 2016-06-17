(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.services', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.services', {
      url: '/services',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/services/services.html',
      controller: ApplicationServicesController,
      controllerAs: 'applicationServicesCtrl'
    });
  }

  ApplicationServicesController.$inject = [
    '$scope',
    'app.model.modelManager',
    'app.event.eventService',
    '$stateParams'
  ];

  /**
   * @name ApplicationServicesController
   * @constructor
   * @param {object} $scope - the Angular $scope service
   * @param {app.model.modelManager} modelManager - the model management service
   * @param {app.event.eventService} eventService - the event bus service
   * @param {object} $stateParams - the UI router $stateParams service
   * @property {object} model - the Cloud Foundry applications model
   * @property {string} id - the application GUID
   */
  function ApplicationServicesController($scope, modelManager, eventService, $stateParams) {
    var that = this;
    this.model = modelManager.retrieve('cloud-foundry.model.space');
    this.appModel = modelManager.retrieve('cloud-foundry.model.application');
    this.id = $stateParams.guid;
    this.cnsiGuid = $stateParams.cnsiGuid;
    this.services = [];

    $scope.$watch(function () {
      return that.appModel.application.summary;
    }, function (summary) {
      var spaceGuid = summary.space_guid;
      if (angular.isDefined(spaceGuid)) {
        that.model.listAllServicesForSpace(that.cnsiGuid, spaceGuid)
          .then(function (services) {
            that.services.length = 0;
            [].push.apply(that.services, services);
          });
      }
    });
  }

  angular.extend(ApplicationServicesController.prototype, {
  });

})();
