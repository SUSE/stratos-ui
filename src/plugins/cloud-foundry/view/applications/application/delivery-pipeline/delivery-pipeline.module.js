(function () {
  'use strict';

  var LEGACY_TOKEN = 'legacy token';
  var DELETED_TOKEN = 'token deleted';

  angular
    .module('cloud-foundry.view.applications.application.delivery-pipeline', [])
    .config(registerRoute);

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.delivery-pipeline', {
      url: '/delivery-pipeline',
      params: {
        showSetup: false
      },
      templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-pipeline/delivery-pipeline.html',
      controller: ApplicationDeliveryPipelineController,
      controllerAs: 'applicationDeliveryPipelineCtrl'
    });
  }

  /**
   * @name ApplicationDeliveryPipelineController
   * @constructor
   * @param {app.utils.appEventService} appEventService - the application event bus
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.view.vcs.appManageVcsTokens} appManageVcsTokens - the VCS token manager
   * @param {app.view.vcs.appManageVcsTokens} appRegisterVcsToken - service to register a new VCS token
   * @param {helion.framework.widgets.dialog.confirm} frameworkDialogConfirm - the confirmation dialog service
   * @param {app.view.appNotificationsService} appNotificationsService The toasts notifications service
   * @param {object} cfAddNotificationService - Service for adding new notifications
   * @param {object} cfPostDeployActionService - Service for adding a new post-deploy action
   * @param {app.utils.appUtilsService} appUtilsService - the console appUtilsService service
   * @param {helion.framework.widgets.frameworkDetailView} frameworkDetailView - The console's frameworkDetailView service
   * @param {string} PAT_DELIMITER - the delimiter constant used to separate the PAT guid in the project name
   * @param {object} $interpolate - the Angular $interpolate service
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $scope  - the Angular $scope
   * @param {object} $q - the Angular $q service
   * @param {object} $state - the UI router $state service
   * @param {object} $log - the Angular $log service
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {string} id - the application GUID
   * @property {frameworkDetailView} frameworkDetailView - The console's frameworkDetailView service
   */
  function ApplicationDeliveryPipelineController(appEventService, modelManager, appManageVcsTokens, appRegisterVcsToken, frameworkDialogConfirm, appNotificationsService,
                                                 cfAddNotificationService, cfPostDeployActionService, appUtilsService, frameworkDetailView, PAT_DELIMITER,
                                                 $interpolate, $stateParams, $scope, $q, $state, $log) {
    var that = this;

    this.appManageVcsTokens = appManageVcsTokens;
    this.appRegisterVcsToken = appRegisterVcsToken;
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.bindingModel = modelManager.retrieve('cloud-foundry.model.service-binding');
    this.userProvidedInstanceModel = modelManager.retrieve('cloud-foundry.model.user-provided-service-instance');
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.account = modelManager.retrieve('app.model.account');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.frameworkDetailView = frameworkDetailView;
    this.vcsModel = modelManager.retrieve('cloud-foundry.model.vcs');

    this.cnsiGuid = $stateParams.cnsiGuid;
    this.id = $stateParams.guid;
    this.appEventService = appEventService;
    this.appManageVcsTokens = appManageVcsTokens;
    this.$interpolate = $interpolate;
    this.$scope = $scope;
    this.$log = $log;
    this.frameworkDialogConfirm = frameworkDialogConfirm;
    this.appNotificationsService = appNotificationsService;
    this.cfAddNotificationService = cfAddNotificationService;
    this.cfPostDeployActionService = cfPostDeployActionService;
    this.PAT_DELIMITER = PAT_DELIMITER;

    this.hceCnsi = null;

    this.project = null;
    this.notificationTargets = [];
    this.postDeployActions = [];

    this.isDeleting = false;
    this.deleteError = false;
    this.busy = false;
    this.modelUpdated = false;

    this.hceServices = {
      fetching: true,
      available: 0,
      valid: 0,
      isAdmin: this.account.isAdmin()
    };

    function init() {
      // Fetch HCE service metadata so that we can show the appropriate message
      that.hceServices.available = _.filter(that.cnsiModel.serviceInstances, {cnsi_type: 'hce'}).length;
      that.hceServices.valid = _.filter(that.userCnsiModel.serviceInstances, {cnsi_type: 'hce', valid: true}).length;
      that.hceServices.fetching = false;

      var promises = [];
      // List VCS tokens if needed
      if (!that.vcsModel.vcsTokensFetched) {
        promises.push(that.vcsModel.listVcsTokens().then(function () {
          that.vcsModel.checkTokensValidity();
        }));
      }

      // List VCS clients if needed
      if (!that.vcsModel.vcsClientsFetched) {
        promises.push(that.vcsModel.listVcsClients());
      }

      return $q.all(promises);
    }

    appUtilsService.chainStateResolve('cf.applications.application.delivery-pipeline', $state, init);

    this.notificationTargetActions = [
      {
        name: gettext('Delete'),
        execute: function (target) {
          that.frameworkDialogConfirm({
            title: gettext('Delete Notification Target'),
            description: gettext('Are you sure you want to delete this notification target?'),
            submitCommit: true,
            buttonText: {
              yes: gettext('Delete'),
              no: gettext('Cancel')
            }
          }).result.then(function () {
            that.hceModel.removeNotificationTarget(that.hceCnsi.guid, target.id)
              .then(function () {
                _.remove(that.notificationTargets, {id: target.id});
              });
          });

        }
      }
    ];

    this.postDeployActionActions = [
      {
        name: gettext('Delete'),
        execute: function (target) {
          that.frameworkDialogConfirm({
            title: gettext('Delete Post Deploy Task'),
            description: gettext('Are you sure you want to delete this post deploy task?'),
            submitCommit: true,
            buttonText: {
              yes: gettext('Delete'),
              no: gettext('Cancel')
            }
          }).result.then(function () {
            that.hceModel.removePipelineTask(that.hceCnsi.guid, target.pipeline_task_id)
              .then(function () {
                _.remove(that.postDeployActions, {pipeline_task_id: target.pipeline_task_id});
              });
          });
        }
      }
    ];

    this.$scope.$watch(function () {
      return !that.model.application.pipeline.fetching &&
        that.model.application.pipeline.valid &&
        that.model.application.pipeline.hce_api_url &&
        that.model.application.project !== null;
    }, function () {
      var pipeline = that.model.application.pipeline;
      if (pipeline && pipeline.valid && pipeline.hceCnsi && that.model.application.project) {
        that.hceCnsi = pipeline.hceCnsi;
        that.project = that.model.application.project;
        that.getPipelineData();
        that.modelUpdated = true;
      } else {
        that.project = null;
      }
    });

    this.$scope.$watch(function () {
      return that.model.application.project;
    }, function (newProject, oldProject) {
      if (_.get(newProject, 'id') === _.get(oldProject, 'id')) {
        that.getPipelineData();
      }
    });

    /**
     * @name setupPipeline
     * @description Show the delivvery pipeline workflow in a slide-in
     **/
    this.setupPipeline = function () {
      that.frameworkDetailView(
        {
          templateUrl: 'plugins/cloud-foundry/view/applications/workflows/add-pipeline-workflow/add-pipeline-dialog.html'
        }
      );
    };

    if ($stateParams.showSetup) {
      this.setupPipeline();
    }
  }

  angular.extend(ApplicationDeliveryPipelineController.prototype, {

    deletePipeline: function () {
      var that = this;
      this.frameworkDialogConfirm({
        title: 'Delete Pipeline',
        description: 'Are you sure you want to delete this pipeline?',
        submitCommit: true,
        buttonText: {
          yes: 'Delete',
          no: 'Cancel'
        }
      }).result.then(function () {
        that.isDeleting = true;
        return that.hceModel.removeProject(that.hceCnsi.guid, that.project.id)
          .then(function () {
            return that._deleteHCEServiceInstance();
          })
          .then(function () {
            // show notification for successful binding
            var successMsg = gettext("The pipeline for '{{appName}}' has been deleted");
            var message = that.$interpolate(successMsg)({appName: that.model.application.summary.name});
            that.appEventService.$emit('cf.events.NOTIFY_SUCCESS', {message: message});

            return that.model.updateDeliveryPipelineMetadata();
          })
          .catch(function () {
            that.deleteError = true;
          })
          .finally(function () {
            that.isDeleting = false;
          });
      });
    },

    getPipelineData: function () {
      if (this.hceCnsi && this.project) {
        var that = this;
        this.hceModel.getBuildContainer(this.hceCnsi.guid, this.project.build_container_id)
          .then(function (response) {
            that.project.buildContainer = response.data;
          });

        this.hceModel.getNotificationTargets(this.hceCnsi.guid, this.project.id)
          .then(function (response) {
            that.notificationTargets.length = 0;
            [].push.apply(that.notificationTargets, that.hceModel.filterNotificationTargets(response.data));
          });

        this.hceModel.listNotificationTargetTypes(this.hceCnsi.guid);

        this.hceModel.getPipelineTasks(this.hceCnsi.guid, this.project.id)
          .then(function (response) {
            that.postDeployActions.length = 0;
            [].push.apply(that.postDeployActions, response.data);
          });

      }
    },

    isLegacyToken: function () {
      return this.getTokenName() === LEGACY_TOKEN;
    },

    isTokenDeleted: function () {
      return this.getTokenName() === DELETED_TOKEN;
    },

    getTokenName: function () {
      var patGuid = this._getPatGuid();
      if (_.isUndefined(patGuid)) {
        // the project uses a legacy OAuth token
        return LEGACY_TOKEN;
      }
      var tokenInUse = this.vcsModel.getToken(patGuid);
      if (_.isUndefined(tokenInUse)) {
        // The user deleted the token from the Console...
        return DELETED_TOKEN;
      }
      return tokenInUse.token.name;
    },

    isInvalidToken: function () {
      var patGuid = this._getPatGuid();
      if (_.isUndefined(patGuid)) {
        // the project uses a legacy OAuth token
        return false;
      }
      var tokenInUse = this.vcsModel.getToken(patGuid);
      if (_.isUndefined(tokenInUse)) {
        // The user deleted the token from the Console...
        return false;
      }
      return this.vcsModel.invalidTokens[tokenInUse.token.guid];
    },

    manageVcsTokens: function () {
      var that = this;
      var vcs = that._getVcs();
      if (vcs) {
        var tokensForVcs = that.vcsModel.getTokensForVcs(vcs);
        if (tokensForVcs.length > 0) {
          return that._manageTokens(vcs);
        } else {
          return that.appRegisterVcsToken.registerToken(vcs).then(function () {
            return that._manageTokens(vcs);
          });
        }

      } else {
        this.$log.error('Cannot find VCS to manage tokens', that.hceModel.data.vcsInstance);
      }
    },

    addNotificationTarget: function () {
      var that = this;
      this.cfAddNotificationService.add(this.hceCnsi && this.hceCnsi.guid)
        .result
        .then(function (notificationTargetData) {
          that.notificationTargets.push(notificationTargetData);
        });
    },

    addPostDeployAction: function () {
      var that = this;
      this.cfPostDeployActionService.add(this.hceCnsi.guid, this.project.id)
        .result
        .then(function (postDeployAction) {
          that.postDeployActions.push(postDeployAction.data);
        });
    },

    _getVcs: function () {
      var vi = this.hceModel.data.vcsInstance;
      return _.find(this.vcsModel.vcsClients, function (vc) {
        return vc.browse_url === vi.browse_url && vc.api_url === vi.api_url && vc.label === vi.label;
      });
    },

    _deleteHCEServiceInstance: function () {
      var that = this;
      var serviceInstanceGuid = this.model.application.pipeline.hceServiceGuid;
      return this.userProvidedInstanceModel.listAllServiceBindings(this.cnsiGuid, serviceInstanceGuid)
        .then(function (response) {
          var bindingGuid = response.data.resources[0].metadata.guid;
          return that.bindingModel.deleteServiceBinding(that.cnsiGuid, bindingGuid)
            .then(function () {
              return that.userProvidedInstanceModel.deleteUserProvidedServiceInstance(that.cnsiGuid, serviceInstanceGuid);
            });
        });
    },

    _getPatGuid: function () {
      if (!this.project) {
        return undefined;
      }
      return this.appManageVcsTokens.getPatGuid(this.project.name);
    },

    _manageTokens: function (vcs) {
      var that = this;
      var patGuid = that._getPatGuid();
      return that.appManageVcsTokens.manage(vcs, true, patGuid).then(function (newTokenGuid) {
        // If the token was changed. update the HCE project
        if (newTokenGuid !== patGuid) {
          that.project.name = that.appManageVcsTokens.updateProjectName(that.project.name, newTokenGuid);
          return that.hceModel.updateProject(that.hceCnsi.guid, newTokenGuid, that.project.id, that.project).then(function (res) {
            that.model.application.project = res.data;
            var newTokenName = that.vcsModel.getToken(newTokenGuid).token.name;
            that.appNotificationsService.notify('success', gettext('Delivery pipeline updated to use Personal Access Token \'{{ name }}\''),
              {name: newTokenName});
          });
        }
      });
    }

  });

})();
