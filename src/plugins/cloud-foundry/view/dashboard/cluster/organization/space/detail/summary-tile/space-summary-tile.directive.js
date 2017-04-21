(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.dashboard.cluster.organization.space.detail')
    .directive('spaceSummaryTile', SpaceSummaryTile);

  function SpaceSummaryTile() {
    return {
      bindToController: {
        space: '='
      },
      controller: SpaceSummaryTileController,
      controllerAs: 'spaceSummaryTileCtrl',
      scope: {},
      templateUrl: 'plugins/cloud-foundry/view/dashboard/cluster/organization/space/detail/summary-tile/space-summary-tile.html'
    };
  }

  /**
   * @name SpaceSummaryTileController
   * @constructor
   * @param {object} $state - the angular $state service
   * @param {object} $scope - the angular $scope service
   * @param {object} $stateParams - the angular $stateParams service
   * @param {object} $q - the angular $q service
   * @param {app.model.modelManager} modelManager - the model management service
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {app.view.appNotificationsService} appNotificationsService - the toast notification service
   * @param {cloud-foundry.view.dashboard.cluster.appClusterCliCommands} appClusterCliCommands - service to show cli command slide out
   * @param {object} frameworkDialogConfirm - our confirmation dialog service
   * @param {object} frameworkAsyncTaskDialog - our async dialog service
   * @param {object} cfOrganizationModel - the cfOrganizationModel service
   * @property {Array} actions - collection of relevant actions that can be executed against cluster
   */
  function SpaceSummaryTileController($state, $scope, $stateParams, $q, modelManager, appUtilsService, appNotificationsService,
                                      appClusterCliCommands, frameworkDialogConfirm, frameworkAsyncTaskDialog, cfOrganizationModel) {
    var vm = this;

    vm.clusterGuid = $stateParams.guid;
    vm.organizationGuid = $stateParams.organization;
    vm.spaceGuid = $stateParams.space;
    vm.userServiceInstance = modelManager.retrieve('app.model.serviceInstance.user');
    vm.cardData = {
      title: gettext('Summary')
    };
    vm.roles = [];
    vm.memory = '';
    vm.spaceDetail = spaceDetail;
    vm.getEndpoint = getEndpoint;
    vm.showCliCommands = showCliCommands;

    var spaceModel = modelManager.retrieve('cloud-foundry.model.space');
    var stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');
    var user = stackatoInfo.info.endpoints.hcf[vm.clusterGuid].user;
    var authModel = modelManager.retrieve('cloud-foundry.model.auth');
    var spaceDetailObj;

    var renameAction = {
      name: gettext('Rename Space'),
      disabled: true,
      execute: function () {
        return frameworkAsyncTaskDialog(
          {
            title: gettext('Rename Space'),
            templateUrl: 'plugins/cloud-foundry/view/dashboard/cluster/detail/actions/edit-space.html',
            submitCommit: true,
            buttonTitles: {
              submit: gettext('Save')
            },
            class: 'dialog-form',
            dialog: true
          },
          {
            data: {
              name: spaceDetail().details.space.entity.name,
              spaceNames: _.map(cfOrganizationModel.organizations[vm.clusterGuid][vm.organizationGuid].spaces, function (space) {
                return space.entity.name;
              })
            }
          },
          function (spaceData) {
            if (spaceData.name && spaceData.name.length > 0) {
              if (spaceDetail().details.space.entity.name === spaceData.name) {
                return $q.resolve();
              }
              return spaceModel.updateSpace(vm.clusterGuid, vm.organizationGuid, vm.spaceGuid,
                {name: spaceData.name})
                .then(function () {
                  appNotificationsService.notify('success', gettext('Space \'{{name}}\' successfully updated'),
                    {name: spaceData.name});
                });
            } else {
              return $q.reject('Invalid Name!');
            }
          }
        );
      }
    };
    var deleteAction = {
      name: gettext('Delete Space'),
      disabled: true,
      execute: function () {
        return frameworkDialogConfirm({
          title: gettext('Delete Space'),
          description: gettext('Are you sure you want to delete space') +
          " '" + spaceDetail().details.space.entity.name + "'?",
          submitCommit: true,
          buttonText: {
            yes: gettext('Delete'),
            no: gettext('Cancel')
          },
          errorMessage: gettext('Failed to delete space'),
          callback: function () {
            return spaceModel.deleteSpace(vm.clusterGuid, vm.organizationGuid, vm.spaceGuid)
              .then(function () {
                appNotificationsService.notify('success', gettext('Space \'{{name}}\' successfully deleted'),
                  {name: spaceDetail().details.space.entity.name});
                // After a successful delete, go up the breadcrumb tree (the current org no longer exists)
                return $state.go($state.current.ncyBreadcrumb.parent());
              });
          }
        });
      }
    };

    vm.isAdmin = user.admin;

    $scope.$watchCollection(function () {
      var space = spaceDetail();
      if (space && space.roles && space.roles[user.guid]) {
        return space.roles[user.guid];
      }
    }, function (roles) {
      // Present the user's roles
      vm.roles = spaceModel.spaceRolesToStrings(roles);
    });

    // Ensure the parent state is fully initialised before we start our own init
    appUtilsService.chainStateResolve('endpoint.clusters.cluster.organization.space.detail', $state, init);

    function getEndpoint() {
      return appUtilsService.getClusterEndpoint(vm.userServiceInstance.serviceInstances[vm.clusterGuid]);
    }

    function showCliCommands() {
      appClusterCliCommands.show(getEndpoint(), vm.userName, vm.clusterGuid,
        cfOrganizationModel.organizations[vm.clusterGuid][vm.organizationGuid],
        spaceDetail());
    }

    function enableActions() {
      vm.actions = [];

      // Rename Space
      var canRename = authModel.isAllowed(vm.clusterGuid, authModel.resources.space, authModel.actions.rename,
        spaceDetailObj.details.guid, vm.organizationGuid);
      if (canRename || vm.isAdmin) {
        renameAction.disabled = false;
        vm.actions.push(renameAction);
      }

      // Delete Space
      var isSpaceEmpty = spaceDetailObj.details.totalRoutes === 0 &&
        spaceDetailObj.details.totalServiceInstances === 0 &&
        spaceDetailObj.details.totalApps === 0;
      var canDelete = authModel.isAllowed(vm.clusterGuid, authModel.resources.space,
        authModel.actions.delete, vm.organizationGuid);
      if (canDelete || vm.isAdmin) {
        deleteAction.disabled = !isSpaceEmpty;
        vm.actions.push(deleteAction);
      }

      if (vm.actions.length < 1) {
        delete vm.actions;
      }
    }

    function init() {
      vm.userName = user.name;
      spaceDetailObj = spaceDetail();
      vm.memory = appUtilsService.sizeUtilization(spaceDetailObj.details.memUsed, spaceDetailObj.details.memQuota);

      // If navigating to/reloading the space details page these will be missing. Do these here instead of in
      // getSpaceDetails to avoid blocking state init when there are 100s of spaces
      var updatePromises = [];
      if (angular.isUndefined(spaceDetailObj.details.totalRoutes)) {
        updatePromises.push(spaceModel.updateRoutesCount(vm.clusterGuid, vm.spaceGuid));
      }
      if (angular.isUndefined(spaceDetailObj.details.totalServices)) {
        updatePromises.push(spaceModel.updateServiceCount(vm.clusterGuid, vm.spaceGuid));
      }

      return $q.all(updatePromises).then(function () {

        // Update delete action when space info changes (requires authService which depends on chainStateResolve)
        $scope.$watch(function () {
          return !spaceDetailObj.details.totalRoutes && !spaceDetailObj.details.totalServiceInstances && !spaceDetailObj.details.totalApps;
        }, function () {
          enableActions();
        });

        enableActions();
        return $q.resolve();
      });

    }

    function spaceDetail() {
      return spaceModel.fetchSpace(vm.clusterGuid, vm.spaceGuid);
    }

  }

})();
