(function () {
  'use strict';

  describe('space detail (users) module', function () {

    var $controller, $httpBackend, $scope;

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));

    var clusterGuid = 'guid';
    var organizationGuid = 'organizationGuid';
    var spaceGuid = 'spaceGuid';

    var space = {
      details: {
        space: {
          metadata: {
            guid: spaceGuid
          }
        }
      }
    };
    var userGuid = 'userGuid';

    function initController($injector, role) {
      $httpBackend = $injector.get('$httpBackend');

      $scope = $injector.get('$rootScope').$new();
      var $state = $injector.get('$state');
      var $stateParams = $injector.get('$stateParams');
      $stateParams.guid = clusterGuid;
      $stateParams.organization = organizationGuid;
      $stateParams.space = spaceGuid;

      var $log = $injector.get('$log');
      var $q = $injector.get('$q');
      var modelManager = $injector.get('app.model.modelManager');
      var utils = $injector.get('app.utils.utilsService');
      var manageUsers = $injector.get('app.view.endpoints.clusters.cluster.manageUsers');
      var rolesService = $injector.get('app.view.endpoints.clusters.cluster.rolesService');
      var eventService = $injector.get('app.event.eventService');
      var userSelection = $injector.get('app.view.userSelection');

      var spaceModel = modelManager.retrieve('cloud-foundry.model.space');
      _.set(spaceModel, 'spaces.' + clusterGuid + '.' + spaceGuid, space);
      //
      // var organizationModel = modelManager.retrieve('cloud-foundry.model.organization');
      // _.set(organizationModel, 'organizations.' + clusterGuid + '.' + organizationGuid, {});
      //
      mock.cloudFoundryModel.Auth.initAuthModel(role, userGuid, $injector);

      var stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');
      stackatoInfo = _.set(stackatoInfo, 'info.endpoints.hcf.' + clusterGuid + '.user', {
        guid: 'user_guid',
        admin: true
      });
      // //
      $httpBackend.expectGET('/pp/v1/proxy/v2/users?results-per-page=100').respond({resources: []});

      var SpaceUsersController = $state.get('endpoint.clusters.cluster.organization.space.detail.users').controller;
      $controller = new SpaceUsersController($scope, $state, $stateParams, $log, $q, modelManager, utils, manageUsers,
        rolesService, eventService, userSelection);
    }

    describe('as admin', function () {
      beforeEach(inject(function ($injector) {
        initController($injector, 'admin');
      }));

      it('initial state', function () {
        expect($controller).toBeDefined();
        expect($controller.guid).toEqual(clusterGuid);
        expect($controller.organizationGuid).toEqual(organizationGuid);
        expect($controller.spaceGuid).toEqual(spaceGuid);
        expect($controller.space).toEqual(space);
        expect($controller.userActions).toBeDefined();
        expect($controller.userActions.length).toEqual(3);
        expect($controller.userRoles).toBeDefined();
        expect($controller.stateInitialised).toBeFalsy();
        expect($controller.canUserManageRoles).toBeDefined();
        expect($controller.canUserRemoveFromOrg).toBeDefined();
        expect($controller.canUserRemoveFromSpace).toBeDefined();

        expect($controller.disableManageRoles).toBeDefined();
        expect($controller.disableChangeRoles).toBeDefined();
        expect($controller.disableRemoveFromOrg).toBeDefined();
        expect($controller.disableRemoveFromSpace).toBeDefined();

        expect($controller.getSpaceRoles).toBeDefined();
        expect($controller.selectAllChanged).toBeDefined();
        expect($controller.removeSpaceRole).toBeDefined();
        expect($controller.selectedUsersCount).toBeDefined();
        expect($controller.manageSelectedUsers).toBeDefined();
        expect($controller.removeFromOrganization).toBeDefined();
        expect($controller.removeFromSpace).toBeDefined();

        $httpBackend.flush();

        expect($controller.stateInitialised).toBeTruthy();
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();

      });

      it('should have manage roles enabled', function () {
        expect($controller.userActions[0].disabled).toBeFalsy();
      });

      it('should have remove from organization enabled', function () {
        expect($controller.userActions[1].disabled).toBeFalsy();
      });

      it('should have remove from space enabled', function () {
        expect($controller.userActions[2].disabled).toBeFalsy();
      });

    });

    describe('as non-admin', function () {
      beforeEach(inject(function ($injector) {
        initController($injector, 'space_developer');
      }));

      it('should have manage roles disabled', function () {
        expect($controller.userActions[0].disabled).toBeTruthy();
      });

      it('should have remove from organization disabled', function () {
        expect($controller.userActions[1].disabled).toBeTruthy();
      });

      it('should have remove from space disabled', function () {
        expect($controller.userActions[2].disabled).toBeTruthy();
      });

    });

  });

})();
