(function () {
  'use strict';

  describe('space-summary-tile directive', function () {
    var $httpBackend, element, controller;

    var clusterGuid = 'guid';
    var organizationGuid = 'organizationGuid';
    var spaceGuid = 'spaceGuid';

    var space = {
      details: {
        space: {
          metadata: {
            guid: spaceGuid
          }
        },
        totalApps: 0,
        totalServiceInstances: 0
      }
    };
    var userGuid = 'userGuid';

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
    }));

    function initController($injector, role) {
      $httpBackend = $injector.get('$httpBackend');

      var $stateParams = $injector.get('$stateParams');
      $stateParams.guid = clusterGuid;
      $stateParams.organization = organizationGuid;
      $stateParams.space = spaceGuid;

      var modelManager = $injector.get('app.model.modelManager');

      var spaceModel = modelManager.retrieve('cloud-foundry.model.space');
      _.set(spaceModel, 'spaces.' + clusterGuid + '.' + spaceGuid, _.cloneDeep(space));

      var authModelOpts = {
        role: role,
        userGuid: userGuid,
        cnsiGuid: clusterGuid,
        spaceGuid: spaceGuid
      };

      mock.cloudFoundryModel.Auth.initAuthModel($injector, authModelOpts);

      var stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');
      _.set(stackatoInfo, 'info.endpoints.hcf.' + clusterGuid + '.user', {
        guid: 'user_guid',
        admin: true
      });

      $httpBackend.expectGET('/pp/v1/proxy/v2/spaces/' + spaceGuid + '/routes?results-per-page=1')
        .respond({
          total_results: 0
        });
      $httpBackend.expectGET('/pp/v1/proxy/v2/spaces/' + spaceGuid + '/services?results-per-page=1')
        .respond({
          total_results: 0
        });

      var $compile = $injector.get('$compile');

      var contextScope = $injector.get('$rootScope').$new();
      contextScope.space = {};

      var markup = '<space-summary-tile ' +
        'space="space">' +
        '</space-summary-tile>';

      element = angular.element(markup);
      $compile(element)(contextScope);

      contextScope.$apply();
      controller = element.controller('spaceSummaryTile');
    }

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('admin user', function () {

      beforeEach(inject(function ($injector) {
        initController($injector, 'admin');
        $httpBackend.flush();
      }));

      it('init', function () {
        expect(element).toBeDefined();
        expect(controller).toBeDefined();

        expect(controller.clusterGuid).toBe(clusterGuid);
        expect(controller.organizationGuid).toBe(organizationGuid);
        expect(controller.spaceGuid).toBe(spaceGuid);
        expect(controller.space).toBeDefined();
        expect(controller.cardData).toBeDefined();
        expect(controller.actions).toBeDefined();
        expect(controller.actions.length).toEqual(2);
        expect(controller.getEndpoint).toBeDefined();
        expect(controller.showCliCommands).toBeDefined();
        expect(controller.spaceDetail).toBeDefined();
      });

      it('should have rename space enabled', function () {
        expect(controller.actions[0].disabled).toBeFalsy();
      });

      it('should have delete space enabled', function () {
        expect(controller.actions[1].disabled).toBeFalsy();
      });
    });

    describe('non-admin user', function () {

      beforeEach(inject(function ($injector) {
        initController($injector, 'space_developer');
        $httpBackend.flush();
      }));

      it('should have rename space disabled', function () {
        expect(controller.actions[0].disabled).toBeTruthy();
      });

      it('should have delete space disabled', function () {
        expect(controller.actions[1].disabled).toBeTruthy();
      });
    });
  });

})();
