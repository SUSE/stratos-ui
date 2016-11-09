(function () {
  'use strict';

  describe('list module', function () {

    var $controller, $httpBackend, $scope, eventService, $state;

    var cnsiGuid = 'cnsiGuid';
    // Matches org from ListAllOrganizations
    var orgGuid = 'dbc9862e-6e71-4bb8-a768-8d6597b5bd89';
    // Matches space from ListAllSpacesForOrganization
    var spaceGuid = '0063f106-074b-415a-94ee-5cf3afd7db5c';

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));

    function createController($injector, type) {
      $httpBackend = $injector.get('$httpBackend');

      var $interpolate = $injector.get('$interpolate');
      $state = $injector.get('$state');
      var $timeout = $injector.get('$timeout');
      var $q = $injector.get('$q');
      var modelManager = $injector.get('app.model.modelManager');
      eventService = $injector.get('app.event.eventService');
      var errorService = $injector.get('app.error.errorService');
      var utils = $injector.get('app.utils.utilsService');

      var userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
      if (Object.keys(userCnsiModel.serviceInstances).length === 0) {
        userCnsiModel.serviceInstances = {
          cnsiGuid: {
            cnsi_type: 'hcf',
            guid: cnsiGuid
          }
        };
      }

      var authModelOpts = {
        role: type ? type : 'admin',
        cnsiGuid: cnsiGuid,
        orgGuid: orgGuid,
        spaceGuid: spaceGuid
      };
      mock.cloudFoundryModel.Auth.initAuthModel($injector, authModelOpts);

      $scope = $injector.get('$rootScope').$new();

      var ApplicationsListController = $state.get('cf.applications.list').controller;
      $controller = new ApplicationsListController($scope, $interpolate, $state, $timeout, $q, modelManager, eventService, errorService, utils);
      expect($controller).toBeDefined();

      var listAllOrgs = mock.cloudFoundryAPI.Organizations.ListAllOrganizations('default');
      $httpBackend.whenGET(listAllOrgs.url).respond(200, listAllOrgs.response[200].body);

      var listAllSpacesForOrg = mock.cloudFoundryAPI.Organizations.ListAllSpacesForOrganization(orgGuid);
      $httpBackend.whenGET(listAllSpacesForOrg.url).respond(200, listAllSpacesForOrg.response[200].body);
    }

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('`no app message` tests', function () {

      beforeEach(inject(function ($injector) {
        createController($injector);
      }));

      afterEach(function () {
        $httpBackend.flush();
      });

      it('should return correct message when no filters have been set', function () {
        expect($controller.getNoAppsMessage()).toBe('You have no applications.');
      });

      it('should return the correct message when a cluster filter has been set', function () {
        // set cnsiGuid param
        $controller.model.filterParams.cnsiGuid = 'test';
        expect($controller.getNoAppsMessage()).toBe('This endpoint has no applications.');

      });

      it('should return the correct message when an org filter has been set', function () {
        $controller.model.filterParams.cnsiGuid = 'test';
        $controller.model.filterParams.orgGuid = orgGuid;
        expect($controller.getNoAppsMessage()).toBe('This organization has no applications.');
      });

      it('should return the correct message when a space filter has been set', function () {
        $controller.model.filterParams.cnsiGuid = 'test';
        $controller.model.filterParams.orgGuid = orgGuid;
        $controller.model.filterParams.spaceGuid = 'test';
        expect($controller.getNoAppsMessage()).toBe('This space has no applications.');
      });

    });

    describe('endpoints link tests', function () {

      beforeEach(inject(function ($injector) {
        createController($injector);
        spyOn($state, 'go').and.callFake(function (state) {
          return state;
        });
      }));

      it('should forward to `Endpoints Dashboard` when no clusters are available', function () {
        $controller.model.clusterCount = 0;
        var endpointsLink = $controller.getEndpointsLink();
        expect(endpointsLink).toBe('endpoint.dashboard');
        $httpBackend.flush();
      });

      it('should forward to `cluster view` when a singular cluster is connected', function () {
        $controller.userCnsiModel.serviceInstances = [{
          id: 'test',
          cnsi_type: 'hcf'
        }];
        $controller.model.clusterCount = 1;
        var endpointsLink = $controller.getEndpointsLink();
        expect(endpointsLink).toBe('endpoint.clusters.cluster.detail.organizations');
        $httpBackend.flush();
      });

      it('should take to `Clusters view` when clusters are available ', function () {
        $controller.model.clusterCount = 1;
        $controller.userCnsiModel.serviceInstances = [];
        var endpointsLink = $controller.getEndpointsLink();
        expect(endpointsLink).toBe('endpoint.clusters.tiles');
      });
    });

    describe('filter tests', function () {

      var $q, modelManager, userCnsiModel, orgModel, injector;

      var allFilterValue = 'all';

      function createOrgOrSpace(guid) {
        return {
          metadata: {
            guid: guid
          },
          entity: {}
        };
      }

      beforeEach(inject(function ($injector) {
        injector = $injector;

        $q = $injector.get('$q');
        modelManager = $injector.get('app.model.modelManager');
        userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');

        orgModel = modelManager.retrieve('cloud-foundry.model.organization');
      }));

      describe('Single cluster/org/space', function () {

        beforeEach(function () {
          userCnsiModel.serviceInstances = {
            cnsiGuid1: {
              cnsi_type: 'hcf',
              guid: cnsiGuid
            }
          };
          spyOn(orgModel, 'listAllOrganizations').and.returnValue($q.resolve([ createOrgOrSpace(orgGuid) ]));
          spyOn(orgModel, 'listAllSpacesForOrganization').and.returnValue($q.resolve([ createOrgOrSpace(spaceGuid) ]));

          createController(injector);

          $scope.$digest();
        });

        it('should automatically select', function () {
          expect($controller.model.filterParams.cnsiGuid).toBe(cnsiGuid);
          expect($controller.filter.cnsiGuid).toBe(cnsiGuid);

          expect($controller.model.filterParams.orgGuid).toBe(orgGuid);
          expect($controller.filter.orgGuid).toBe(orgGuid);

          expect($controller.model.filterParams.spaceGuid).toBe(spaceGuid);
          expect($controller.filter.spaceGuid).toBe(spaceGuid);
        });
      });

      describe('Multiple clusters/orgs/spaces', function () {

        beforeEach(function () {
          userCnsiModel.serviceInstances = {
            cnsiGuid1: {
              cnsi_type: 'hcf',
              guid: 'cnsiGuid1'
            },
            cnsiGuid2: {
              cnsi_type: 'hcf',
              guid: 'cnsiGuid2'
            }
          };
          spyOn(orgModel, 'listAllOrganizations').and.returnValue($q.resolve([
            createOrgOrSpace(orgGuid),
            createOrgOrSpace('orgGuid2')
          ]));
          spyOn(orgModel, 'listAllSpacesForOrganization').and.returnValue($q.resolve([
            createOrgOrSpace(spaceGuid),
            createOrgOrSpace('spaceGuid2')
          ]));

          createController(injector);

          $scope.$digest();

          expect($controller.model.filterParams.cnsiGuid).toBe(allFilterValue);
          expect($controller.filter.cnsiGuid).toBe(allFilterValue);

          expect($controller.model.filterParams.orgGuid).toBe(allFilterValue);
          expect($controller.filter.orgGuid).toBe(allFilterValue);
          // The count will be orgs + 1 (for the 'all' options)
          expect($controller.organizations.length).toBe(1);

          expect($controller.model.filterParams.spaceGuid).toBe(allFilterValue);
          expect($controller.filter.spaceGuid).toBe(allFilterValue);
          // The count will be spaces + 1 (for the 'all' options)
          expect($controller.spaces.length).toBe(1);
        });

        it('should correctly set organisations when a cluster is selected', function () {
          $controller.filter.cnsiGuid = cnsiGuid;
          $controller.setCluster();

          $scope.$digest();

          expect($controller.model.filterParams.cnsiGuid).toBe(cnsiGuid);
          expect($controller.filter.cnsiGuid).toBe(cnsiGuid);

          expect($controller.model.filterParams.orgGuid).toBe(allFilterValue);
          expect($controller.filter.orgGuid).toBe(allFilterValue);
          // The count will be orgs + 1 (for the 'all' options)
          expect($controller.organizations.length).toBe(3);

          expect($controller.model.filterParams.spaceGuid).toBe(allFilterValue);
          expect($controller.filter.spaceGuid).toBe(allFilterValue);
          // The count will be spaces + 1 (for the 'all' options)
          expect($controller.spaces.length).toBe(1);
        });

        it('should correctly set spaces when an organisation is selected', function () {
          $controller.filter.cnsiGuid = cnsiGuid;
          $controller.setCluster();

          $controller.filter.orgGuid = orgGuid;
          $controller.setOrganization();

          $scope.$digest();

          expect($controller.model.filterParams.cnsiGuid).toBe(cnsiGuid);
          expect($controller.filter.cnsiGuid).toBe(cnsiGuid);

          expect($controller.model.filterParams.orgGuid).toBe(orgGuid);
          expect($controller.filter.orgGuid).toBe(orgGuid);
          // The count will be orgs + 1 (for the 'all' options)
          expect($controller.organizations.length).toBe(3);

          expect($controller.model.filterParams.spaceGuid).toBe(allFilterValue);
          expect($controller.filter.spaceGuid).toBe(allFilterValue);
          // The count will be spaces + 1 (for the 'all' options)
          expect($controller.spaces.length).toBe(3);
        });

        it('should correctly select spaces', function () {
          $controller.filter.cnsiGuid = cnsiGuid;
          $controller.setCluster();

          $controller.filter.orgGuid = orgGuid;
          $controller.setOrganization();

          $controller.filter.spaceGuid = spaceGuid;
          $controller.setSpace();

          $scope.$digest();

          expect($controller.model.filterParams.cnsiGuid).toBe(cnsiGuid);
          expect($controller.filter.cnsiGuid).toBe(cnsiGuid);

          expect($controller.model.filterParams.orgGuid).toBe(orgGuid);
          expect($controller.filter.orgGuid).toBe(orgGuid);
          // The count will be orgs + 1 (for the 'all' options)
          expect($controller.organizations.length).toBe(3);

          expect($controller.model.filterParams.spaceGuid).toBe(spaceGuid);
          expect($controller.filter.spaceGuid).toBe(spaceGuid);
          // The count will be spaces + 1 (for the 'all' options)
          expect($controller.spaces.length).toBe(3);
        });

      });

    });

    describe('auth model tests for admin', function () {

      beforeEach(inject(function ($injector) {
        createController($injector);
      }));

      afterEach(function () {
        $httpBackend.flush();
      });

      it('should show `Add Application` button to user', function () {
        expect($controller.showAddApplicationButton()).toBe(true);
      });
    });

    describe('auth model tests for non-admin developer', function () {

      beforeEach(inject(function ($injector) {
        createController($injector, 'space_developer', true);
      }));

      it('should show `Add Application` button to user', function () {
        $controller.ready = true;
        $httpBackend.flush();
        expect($controller.showAddApplicationButton()).toBe(true);
      });
    });

    describe('auth model tests for non-admin non-developer', function () {

      beforeEach(inject(function ($injector) {
        createController($injector, 'space_manager', true);
      }));

      it('should hide `Add Application` button to user', function () {
        $controller.ready = true;
        $httpBackend.flush();
        expect($controller.showAddApplicationButton()).toBe(false);
      });
    });

  });

})();
