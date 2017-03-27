(function () {
  'use strict';

  describe('app details - services view', function () {
    var $httpBackend, $scope, appServicesCtrl;

    beforeEach(module('green-box-console'));

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $scope = $injector.get('$rootScope').$new();
      var modelManager = $injector.get('modelManager');
      var eventService = $injector.get('app.event.eventService');
      var $stateParams = $injector.get('$stateParams');
      var $state = $injector.get('$state');

      $stateParams.guid = 'app_123';
      $stateParams.cnsiGuid = 'guid';

      var ApplicationServicesController = $state.get('cf.applications.application.services').controller;
      appServicesCtrl = new ApplicationServicesController($scope, modelManager, eventService, $stateParams);
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should have controller defined', function () {
      expect(appServicesCtrl).toBeDefined();
      expect(appServicesCtrl.model).toBeDefined();
      expect(appServicesCtrl.appModel).toBeDefined();
    });

    it('should have IDs and services initially defined', function () {
      expect(appServicesCtrl.id).toBe('app_123');
      expect(appServicesCtrl.cnsiGuid).toBe('guid');
      expect(appServicesCtrl.services).toEqual([]);
    });

    it('should set services on app summary change', function () {
      var spaceGuid = 'space_123';

      var mockSpacesApi = mock.cloudFoundryAPI.Spaces;
      var ListAllServicesForSpace = mockSpacesApi.ListAllServicesForSpaceWithSSO(spaceGuid);
      $httpBackend.whenGET(ListAllServicesForSpace.url)
        .respond(200, ListAllServicesForSpace.response['200'].body);

      appServicesCtrl.appModel.application.summary = {
        space_guid: spaceGuid,
        services: [ {
          service_plan: {
            service: {
              guid: ListAllServicesForSpace.response['200'].body.resources[0].metadata.guid
            }
          }
        }]
      };

      $scope.$apply();
      $httpBackend.flush();

      expect(appServicesCtrl.services.length).toBeGreaterThan(0);
      expect(appServicesCtrl.services.length).toEqual(3);
      expect(appServicesCtrl.services[0].attached).toBeTruthy();
      expect(appServicesCtrl.services[1].attached).toBeFalsy();
      expect(appServicesCtrl.services[2].attached).toBeFalsy();
    });

    it('should keep services empty on app summary change with no space GUID', function () {
      appServicesCtrl.appModel.application.summary = {
        guid: 'app_123'
      };

      $scope.$apply();

      expect(appServicesCtrl.services.length).toBe(0);
    });

  });

})();
