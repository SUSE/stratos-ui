(function () {
  'use strict';

  describe('manage-services directive', function () {
    var $httpBackend, $scope, appEventService, mockAppsApi, mockApp, mockService, badMockService, manageServicesCtrl;

    beforeEach(module('templates'));
    beforeEach(module('console-app'));

    beforeEach(inject(function ($injector) {
      var $compile = $injector.get('$compile');
      $httpBackend = $injector.get('$httpBackend');
      $scope = $injector.get('$rootScope').$new();
      appEventService = $injector.get('appEventService');

      // mock UI router $stateParams
      var $stateParams = $injector.get('$stateParams');
      $stateParams.cnsiGuid = 'guid';

      var markup = '<manage-services></manage-services>';
      var element = angular.element(markup);
      $compile(element)($scope);

      $scope.$apply();

      manageServicesCtrl = element.controller('manageServices');

      mockService = {
        metadata: {guid: '67229bc6-8fc9-4fe1-b8bc-8790cdae5334'},
        entity: {
          label: 'label-19'
        }
      };
      badMockService = {
        metadata: {guid: 'foo'}
      };

      // mock CF application model - GetAppSummary
      var appGuid = 'app_123';
      mockAppsApi = mock.cloudFoundryAPI.Apps;
      var GetAppSummary = mockAppsApi.GetAppSummary(appGuid);
      mockApp = GetAppSummary.response['200'].body;
      $httpBackend.whenGET(GetAppSummary.url)
        .respond(200, GetAppSummary.response['200'].body);
      // mock CF application model - ListAllServiceBindingsForApp
      var ListAllServiceBindingsForApp = mockAppsApi.ListAllServiceBindingsForApp(appGuid);
      var params = '?q=service_instance_guid+IN+28aa8270-ab0e-480d-b9b6-ba4ec4f15015&results-per-page=100';
      $httpBackend.whenGET(ListAllServiceBindingsForApp.url + params)
        .respond(200, ListAllServiceBindingsForApp.response['200'].body);
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('ManageServicesController', function () {
      it('should be defined and initialized', function () {
        expect(manageServicesCtrl).toBeDefined();
        expect(manageServicesCtrl.$q).toBeDefined();
        expect(manageServicesCtrl.frameworkDetailView).toBeDefined();
        expect(manageServicesCtrl.cfServiceInstanceService).toBeDefined();
        expect(manageServicesCtrl.appModel).toBeDefined();
        expect(manageServicesCtrl.modal).toBe(null);
        expect(manageServicesCtrl.serviceInstances).toEqual([]);
        expect(manageServicesCtrl.serviceBindings).toEqual({});
      });

      it('should have correct functions', function () {
        expect(manageServicesCtrl.reset).toBeDefined();
        expect(manageServicesCtrl.getServiceBindings).toBeDefined();
        expect(manageServicesCtrl.detach).toBeDefined();
        expect(manageServicesCtrl.viewEnvVariables).toBeDefined();
        expect(manageServicesCtrl.startManageServices).toBeDefined();
      });

      it('should call reset and startManageServices on event received', function () {
        spyOn(manageServicesCtrl, 'reset').and.callThrough();
        spyOn(manageServicesCtrl, 'startManageServices').and.callThrough();

        var event = 'cf.events.START_MANAGE_SERVICES';
        var config = {
          app: {
            summary: mockApp
          },
          cnsiGuid: 'guid',
          service: mockService
        };
        appEventService.$emit(event, config);

        $scope.$apply();
        $httpBackend.flush();

        expect(manageServicesCtrl.reset).toHaveBeenCalled();
        expect(manageServicesCtrl.startManageServices).toHaveBeenCalled();
      });

      describe('reset', function () {
        it('should set serviceInstances and serviceBindings', function () {
          spyOn(manageServicesCtrl, 'getServiceBindings').and.callThrough();

          var config = {
            app: {
              summary: mockApp
            },
            cnsiGuid: 'guid',
            service: mockService
          };
          manageServicesCtrl.reset(config);

          $httpBackend.flush();

          expect(manageServicesCtrl.serviceInstances.length).toBeGreaterThan(0);
          expect(manageServicesCtrl.serviceBindings).not.toEqual({});
          expect(manageServicesCtrl.getServiceBindings).toHaveBeenCalled();
        });

        it('should empty serviceInstances and serviceBindings if no app services', function () {
          spyOn(manageServicesCtrl, 'getServiceBindings').and.callThrough();

          var config = {
            app: {
              summary: mockApp
            },
            cnsiGuid: 'guid',
            service: badMockService
          };
          manageServicesCtrl.reset(config);

          expect(manageServicesCtrl.serviceInstances.length).toBe(0);
          expect(manageServicesCtrl.serviceBindings).toEqual({});
          expect(manageServicesCtrl.getServiceBindings).not.toHaveBeenCalled();
        });
      });

      describe('getServiceBindings', function () {
        it('should return service bindings', function () {
          manageServicesCtrl.data = {
            app: {
              summary: mockApp
            },
            cnsiGuid: 'guid'
          };

          manageServicesCtrl.getServiceBindings(['28aa8270-ab0e-480d-b9b6-ba4ec4f15015'])
            .then(function () {
              expect(manageServicesCtrl.serviceBindings).not.toEqual({});
            });

          $httpBackend.flush();
        });
      });

      describe('detach', function () {
        beforeEach(function () {
          var bindingGuid = 'binding_123';

          manageServicesCtrl.modal = {
            dismiss: angular.noop
          };
          manageServicesCtrl.data = {
            app: {
              summary: mockApp
            },
            cnsiGuid: 'guid'
          };
          manageServicesCtrl.serviceInstances = [
            {guid: 'instance_123', name: 'instance_123'},
            {guid: 'instance_456'}
          ];
          manageServicesCtrl.serviceBindings = {
            instance_123: {
              metadata: {guid: bindingGuid}
            },
            instance_456: {
              metadata: {guid: bindingGuid}
            }
          };

          spyOn(manageServicesCtrl.cfServiceInstanceService, 'unbindServiceFromApp');
        });

        it('should call unbindServiceFromApp', function () {
          var instance = manageServicesCtrl.serviceInstances[0];
          manageServicesCtrl.detach(instance);
          expect(manageServicesCtrl.cfServiceInstanceService.unbindServiceFromApp)
            .toHaveBeenCalled();
          var args = manageServicesCtrl.cfServiceInstanceService.unbindServiceFromApp.calls.argsFor(0);
          expect(args[0]).toBe('guid');
          expect(args[1]).toBe('app_123');
          expect(args[2]).toBe('binding_123');
          expect(args[3]).toBe('instance_123');
        });
      });

      describe('viewEnvVariables', function () {
        beforeEach(function () {
          manageServicesCtrl.data = {
            app: {
              summary: mockApp
            },
            cnsiGuid: 'guid',
            service: mockService
          };

          spyOn(manageServicesCtrl.cfServiceInstanceService, 'viewEnvVariables');
        });

        it('should show env variables in detail view', function () {
          manageServicesCtrl.viewEnvVariables({name: 'instance_123'});
          expect(manageServicesCtrl.cfServiceInstanceService.viewEnvVariables)
            .toHaveBeenCalledWith('guid', mockApp, 'label-19', {name: 'instance_123'});
        });
      });
    });
  });

})();
