(function () {
  'use strict';

  describe('organization detail (users) module', function () {

    var $controller, $httpBackend, $scope;

    beforeEach(module('templates'));
    beforeEach(module('console-app'));
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
    }));

    var clusterGuid = 'guid';
    var organizationGuid = 'organizationGuid';
    var userGuid = 'userGuid';

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Permissions with genuine calls', function () {

      function initController($injector, role) {

        $scope = $injector.get('$rootScope').$new();
        var $state = $injector.get('$state');
        var $stateParams = $injector.get('$stateParams');
        $stateParams.guid = clusterGuid;
        $stateParams.organization = organizationGuid;
        var $q = $injector.get('$q');
        var modelManager = $injector.get('modelManager');
        var appUtilsService = $injector.get('appUtilsService');
        var appClusterManageUsers = $injector.get('appClusterManageUsers');
        var appClusterRolesService = $injector.get('appClusterRolesService');
        var appEventService = $injector.get('appEventService');
        var appUserSelection = $injector.get('appUserSelection');
        var cfOrganizationModel = $injector.get('cfOrganizationModel');

        _.set(cfOrganizationModel, 'organizations.' + clusterGuid + '.' + organizationGuid, { details: {guid: organizationGuid } });

        var spaceGuid = 'spaceGuid';

        var authModelOpts = {
          role: role,
          userGuid: userGuid,
          cnsiGuid: clusterGuid,
          spaceGuid: spaceGuid
        };

        mock.cloudFoundryModel.Auth.initAuthModel($injector, authModelOpts);

        if (role === 'admin') {
          $httpBackend.expectGET('/pp/v1/proxy/v2/users?results-per-page=100').respond({resources: []});
        } else {
          $httpBackend.expectGET('/pp/v1/proxy/v2/organizations/' + organizationGuid + '/user_roles?results-per-page=100').respond({resources: []});
        }

        var OrganizationUsersController = $state.get('endpoint.clusters.cluster.organization.detail.users').controller;
        $controller = new OrganizationUsersController($scope, $state, $stateParams, $q, modelManager, appUtilsService, appClusterManageUsers,
          appClusterRolesService, appEventService, appUserSelection, cfOrganizationModel);
      }

      describe('as admin', function () {

        beforeEach(inject(function ($injector) {
          initController($injector, 'admin');
          // Didn't add flush here, because
          // the initial state test requires
          // an initialised controller.
        }));

        // it('initial state', function () {
        //   expect($controller).toBeDefined();
        //   expect($controller.guid).toEqual(clusterGuid);
        //   expect($controller.organizationGuid).toEqual(organizationGuid);
        //   expect($controller.userRoles).toBeDefined();
        //   expect($controller.userActions).toBeDefined();
        //   expect($controller.stateInitialised).toBeFalsy();
        //   expect($controller.canUserManageRoles).toBeDefined();
        //   expect($controller.canUserRemoveFromOrg).toBeDefined();
        //   expect($controller.disableManageRoles).toBeDefined();
        //   expect($controller.disableChangeRoles).toBeDefined();
        //   expect($controller.disableRemoveFromOrg).toBeDefined();
        //   expect($controller.getSpaceRoles).toBeDefined();
        //   expect($controller.selectAllChanged).toBeDefined();
        //   expect($controller.canRemoveSpaceRole).toBeDefined();
        //   expect($controller.removeSpaceRole).toBeDefined();
        //   expect($controller.selectedUsersCount).toBeDefined();
        //   expect($controller.manageSelectedUsers).toBeDefined();
        //   expect($controller.removeFromOrganization).toBeDefined();
        //
        //   $httpBackend.flush();
        //
        //   expect($controller.stateInitialised).toBeTruthy();
        //
        // });

        it('should have manage roles enabled', function () {
          $httpBackend.flush();
          expect($controller.userActions[0].disabled).toBeFalsy();
        });

        it('should have remove from organization enabled', function () {
          $httpBackend.flush();
          expect($controller.userActions[1].disabled).toBeFalsy();
        });

      });

      describe('as non-admin', function () {

        beforeEach(inject(function ($injector) {
          initController($injector, 'space_developer');
          $httpBackend.flush();
        }));

        it('should have no actions', function () {
          if ($controller.actions) {
            expect($controller.actions.length).toBe(0);
          } else {
            expect($controller.actions).not.toBeDefined();
          }
        });

      });
    });

    describe('Standard user table tests', function () {

      var $state, $stateParams, $q, modelManager, appUtilsService, appClusterManageUsers, appClusterRolesService, appEventService, appUserSelection, orgModel;

      var users = [
        {
          metadata: {
            guid: 'userAGuid'
          },
          entity: {
            username: 'userA'
          }
        },
        {
          metadata: {
            guid: 'userBGuid'
          },
          entity: {
            username: 'userB'
          }
        }
      ];

      var space1 = {
        details: {
          guid: 'space1Guid',
          space: {
            metadata: {
              guid: 'space1Guid'
            },
            entity: {
              organization_guid: organizationGuid,
              name: 'Beta'
            }
          }
        }
      };
      _.set(space1, 'roles.' + users[0].metadata.guid, ['space_developer']);
      var space2 = {
        details: {
          guid: 'space2Guid',
          space: {
            metadata: {
              guid: 'space2Guid'
            },
            entity: {
              organization_guid: organizationGuid,
              name: 'Alpha'
            }
          }
        }
      };
      _.set(space2, 'roles.' + users[0].metadata.guid, ['space_manager']);
      var space3 = {
        details: {
          guid: 'space3Guid',
          space: {
            metadata: {
              guid: 'space3Guid'
            },
            entity: {
              organization_guid: organizationGuid,
              name: 'Gamma'
            }
          }
        }
      };
      _.set(space3, 'roles.' + users[0].metadata.guid, ['space_developer']);
      var spaces = {};
      spaces[space1.details.space.metadata.guid] = space1;
      spaces[space2.details.space.metadata.guid] = space2;
      spaces[space3.details.space.metadata.guid] = space3;

      var org1 = {
        spaces: [space1, space2, space3],
        details: {
          guid: organizationGuid,
          org: {
            metadata: {
              guid: organizationGuid
            },
            entity: {
              name: 'Beta'
            }
          }
        }
      };
      var organizations = _.set({}, org1.details.org.metadata.guid, org1);

      function createController() {
        var OrganizationUsersController = $state.get('endpoint.clusters.cluster.organization.detail.users').controller;
        $controller = new OrganizationUsersController($scope, $state, $stateParams, $q, modelManager, appUtilsService, appClusterManageUsers,
          appClusterRolesService, appEventService, appUserSelection, orgModel);
      }

      beforeEach(inject(function ($injector) {

        $scope = $injector.get('$rootScope').$new();
        $state = $injector.get('$state');
        $stateParams = $injector.get('$stateParams');
        $stateParams.guid = clusterGuid;
        $stateParams.organization = organizationGuid;
        $q = $injector.get('$q');
        modelManager = $injector.get('modelManager');
        appUtilsService = $injector.get('appUtilsService');
        appClusterManageUsers = $injector.get('appClusterManageUsers');
        appClusterRolesService = $injector.get('appClusterRolesService');
        appEventService = $injector.get('appEventService');
        appUserSelection = $injector.get('appUserSelection');
        orgModel = $injector.get('cfOrganizationModel');

        var consoleInfo = modelManager.retrieve('app.model.consoleInfo');
        _.set(consoleInfo, 'info.endpoints.cf.' + clusterGuid + '.user', {
          guid: 'user_guid',
          admin: true
        });

        var authModel = modelManager.retrieve('cloud-foundry.model.auth');
        _.set(authModel, 'principal.' + clusterGuid + '.userSummary.organizations.managed', [
          {}
        ]);
        _.set(authModel, 'principal.' + clusterGuid + '.userSummary.spaces.managed', []);
        spyOn(authModel, 'isAllowed').and.callFake(function (cnsiGuid, resource, action, orgGuid) {
          expect(cnsiGuid).toEqual(clusterGuid);
          expect(orgGuid).toEqual(organizationGuid);
          return true;
        });

        // Initial set of organizations
        var cfOrganizationModel = $injector.get('cfOrganizationModel');
        _.set(cfOrganizationModel, 'organizations.' + clusterGuid, organizations);

        // Initial set of spaces
        var spaceModel = modelManager.retrieve('cloud-foundry.model.space');
        _.set(spaceModel, 'spaces.' + clusterGuid, spaces);

        spyOn(appClusterRolesService, 'listUsers').and.callFake(function (inClusterGuid) {
          expect(inClusterGuid).toEqual(clusterGuid);
          return $q.resolve(users);
        });

      }));

      it('initial state', function () {

        createController();

        expect($controller).toBeDefined();
        expect($controller.guid).toEqual(clusterGuid);
        expect($controller.organizationGuid).toEqual(organizationGuid);
        expect($controller.userRoles).toBeDefined();
        expect($controller.userActions).toBeDefined();
        expect($controller.stateInitialised).toBeFalsy();
        expect($controller.canUserManageRoles).toBeDefined();
        expect($controller.canUserRemoveFromOrg).toBeDefined();
        expect($controller.disableManageRoles).toBeDefined();
        expect($controller.disableChangeRoles).toBeDefined();
        expect($controller.disableRemoveFromOrg).toBeDefined();
        expect($controller.getSpaceRoles).toBeDefined();
        expect($controller.selectAllChanged).toBeDefined();
        expect($controller.canRemoveSpaceRole).toBeDefined();
        expect($controller.removeSpaceRole).toBeDefined();
        expect($controller.selectedUsersCount).toBeDefined();
        expect($controller.manageSelectedUsers).toBeDefined();
        expect($controller.removeFromOrganization).toBeDefined();

      });

      it('init', function () {
        createController();
        $scope.$digest();

        expect($controller.stateInitialised).toBeTruthy();
      });

      it('refreshUsers', function () {
        createController();
        $scope.$digest();

        expect($controller.stateInitialised).toBeTruthy();

        // userRoles
        expect($controller.userRoles[users[0].metadata.guid]).toEqual([
          {
            space: space1,
            role: 'space_developer',
            roleLabel: 'Developer'
          },
          {
            space: space2,
            role: 'space_manager',
            roleLabel: 'Manager'
          },
          {
            space: space3,
            role: 'space_developer',
            roleLabel: 'Developer'
          }
        ]);

        // userActions
        expect($controller.userActions).toBeDefined();
        expect($controller.userActions[0].disabled).toBeFalsy();
        expect($controller.userActions[1].disabled).toBeFalsy();

      });

      it('disableManageRoles', function () {
        createController();

        expect($controller.disableManageRoles()).toBeTruthy();

        $controller.selectedUsers = {};
        $controller.selectedUsers[users[0].metadata.guid] = true;
        $controller.selectedUsers[users[1].metadata.guid] = false;

        expect($controller.disableManageRoles()).toBeFalsy();

        $controller.selectedUsers[users[1].metadata.guid] = true;

        expect($controller.disableManageRoles()).toBeTruthy();
      });

      it('disableChangeRoles', function () {
        createController();

        expect($controller.disableChangeRoles()).toBeFalsy();
      });

      it('disableRemoveFromOrg', function () {
        createController();

        expect($controller.disableRemoveFromOrg()).toBeTruthy();

        $controller.selectedUsers = {};
        $controller.selectedUsers[users[0].metadata.guid] = true;

        expect($controller.disableRemoveFromOrg()).toBeFalsy();

        $controller.selectedUsers[users[0].metadata.guid] = false;

        expect($controller.disableRemoveFromOrg()).toBeTruthy();
      });

      it('user actions - execute', function () {
        createController();
        $scope.$digest();

        // Manage Roles
        spyOn(appClusterManageUsers, 'show').and.callFake(function (inClusterGuid, inOrgGuid, inUsers) {
          expect(inClusterGuid).toEqual(clusterGuid);
          expect(inOrgGuid).toEqual(organizationGuid);
          expect(inUsers).toEqual([users[0]]);
          return {
            result: 'defined'
          };
        });
        expect($controller.userActions[0].execute(users[0])).toBeDefined();

        // Remove from org
        spyOn(appClusterRolesService, 'removeFromOrganization').and.callFake(function (inClusterGuid, inOrgGuid, inUsers) {
          expect(inClusterGuid).toEqual(clusterGuid);
          expect(inOrgGuid).toEqual(organizationGuid);
          expect(inUsers).toEqual([users[0]]);
          return 'defined';
        });
        expect($controller.userActions[1].execute(users[0])).toBeDefined();
      });

      it('manageSelectedUsers', function () {
        createController();
        $scope.$digest();

        $controller.selectedUsers = {};
        $controller.selectedUsers[users[0].metadata.guid] = false;
        $controller.selectedUsers[users[1].metadata.guid] = true;

        spyOn(appClusterManageUsers, 'show').and.callFake(function (inClusterGuid, inOrgGuid, inUsers) {
          expect(inClusterGuid).toEqual(clusterGuid);
          expect(inOrgGuid).toEqual(organizationGuid);
          expect(inUsers).toEqual([users[1]]);
          return {
            result: 'defined'
          };
        });

        expect($controller.manageSelectedUsers()).toBeDefined();

      });

      it('removeFromOrganization', function () {
        createController();
        $scope.$digest();

        $controller.selectedUsers = {};
        $controller.selectedUsers[users[0].metadata.guid] = true;
        $controller.selectedUsers[users[1].metadata.guid] = false;

        spyOn(appClusterRolesService, 'removeFromOrganization').and.callFake(function (inClusterGuid, inOrgGuid, inUsers) {
          expect(inClusterGuid).toEqual(clusterGuid);
          expect(inOrgGuid).toEqual(organizationGuid);
          expect(inUsers).toEqual([users[0]]);
          return 'defined';
        });

        expect($controller.removeFromOrganization()).toBeDefined();

      });

      it('selectAllChanged - no selection', function () {
        createController();
        $scope.$digest();

        delete $controller.selectAllUsers;

        spyOn(appUserSelection, 'selectUsers');
        spyOn(appUserSelection, 'deselectAllUsers').and.callFake(function (inClusterGuid) {
          expect(inClusterGuid).toEqual(clusterGuid);
        });

        $controller.selectAllChanged();

        expect(appUserSelection.selectUsers).not.toHaveBeenCalled();
        expect(appUserSelection.deselectAllUsers).toHaveBeenCalled();

      });

      it('selectAllChanged - no selection', function () {
        createController();
        $scope.$digest();

        spyOn(appUserSelection, 'selectUsers').and.callFake(function (inClusterGuid) {
          expect(inClusterGuid).toEqual(clusterGuid);
        });
        spyOn(appUserSelection, 'deselectAllUsers');

        $controller.selectAllChanged();

        expect(appUserSelection.selectUsers).toHaveBeenCalled();
        expect(appUserSelection.deselectAllUsers).not.toHaveBeenCalled();

      });

    });

  });

})();
