(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application', [
      'cloud-foundry.view.applications.application.summary',
      'cloud-foundry.view.applications.application.log-stream',
      'cloud-foundry.view.applications.application.services',
      'cloud-foundry.view.applications.application.delivery-logs',
      'cloud-foundry.view.applications.application.delivery-pipeline',
      'cloud-foundry.view.applications.application.variables',
      'cloud-foundry.view.applications.application.notification-target'
    ])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application', {
      url: '/:cnsiGuid/app/:guid',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/application.html',
      controller: ApplicationController,
      controllerAs: 'appCtrl'
    });
  }

  ApplicationController.$inject = [
    'app.model.modelManager',
    'app.event.eventService',
    '$stateParams',
    '$scope',
    '$window',
    '$q',
    '$interval',
    '$interpolate',
    '$state',
    'helion.framework.widgets.dialog.confirm',
    'app.utils.utilsService'
  ];

  /**
   * @name ApplicationController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.event.eventService} eventService - the event bus service
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $scope - the Angular $scope
   * @param {object} $window - the Angular $window service
   * @param {object} $q - the Angular $q service
   * @param {object} $interval - the Angular $interval service
   * @param {object} $interpolate - the Angular $interpolate service
   * @param {object} $state - the UI router $state service
   * @param {object} confirmDialog - the confirm dialog service
   * @param {object} utils - the utils service
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {object} $window - the Angular $window service
   * @property {object} $q - the Angular $q service
   * @property {object} $interval - the Angular $interval service
   * @property {object} $interpolate - the Angular $interpolate service
   * @property {app.event.eventService} eventService - the event bus service
   * @property {string} id - the application GUID
   * @property {number} tabIndex - index of active tab
   * @property {string} warningMsg - warning message for application
   * @property {object} confirmDialog - the confirm dialog service
   */
  function ApplicationController(modelManager, eventService, $stateParams, $scope, $window, $q, $interval, $interpolate, $state, confirmDialog, utils) {
    var that = this;

    this.$window = $window;
    this.$q = $q;
    this.$interval = $interval;
    this.$interpolate = $interpolate;
    this.eventService = eventService;
    this.confirmDialog = confirmDialog;
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.authModel = modelManager.retrieve('cloud-foundry.model.auth');
    this.cnsiGuid = $stateParams.cnsiGuid;
    this.hceCnsi = null;
    this.id = $stateParams.guid;
    this.ready = false;
    this.warningMsg = gettext('The application needs to be restarted for highlighted variables to be added to the runtime.');
    this.UPDATE_INTERVAL = 5000; // milliseconds
    that.hideVariables = true;
    that.hideDeliveryPipelineData = true;
    // Wait for parent state to be fully initialised
    utils.chainStateResolve('cf.applications', $state, _.bind(this.init, this));

    // When a modal interaction starts, stop the background polling
    this.removeModalStartListener = this.eventService.$on(this.eventService.events.MODAL_INTERACTION_START, function () {
      that.stopUpdate();
    });
    // When a modal interaction ends, resume the background polling
    this.removeModalEndListener = this.eventService.$on(this.eventService.events.MODAL_INTERACTION_END, function () {
      that.startUpdate();
    });

    this.appActions = [
      {
        name: gettext('View App'),
        execute: function () {
          var routes = that.model.application.summary.routes;
          if (routes.length) {
            var route = routes[0];
            var path = angular.isUndefined(route.path) ? '' : '/' + route.path;
            var url = 'http://' + route.host + '.' + route.domain.name + path;
            that.$window.open(url, '_blank');
          }
        },
        disabled: true,
        id: 'launch',
        icon: 'helion-icon helion-icon-lg helion-icon-Launch'
      },
      {
        name: gettext('Stop'),
        id: 'stop',
        execute: function () {
          that.model.stopApp(that.cnsiGuid, that.id);
        },
        disabled: true,
        icon: 'helion-icon helion-icon-lg helion-icon-Halt-stop'
      },
      {
        name: gettext('Restart'),
        id: 'restart',
        execute: function () {
          that.model.restartApp(that.cnsiGuid, that.id);
        },
        disabled: true,
        icon: 'helion-icon helion-icon-lg helion-icon-Refresh'
      },
      {
        name: gettext('Delete'),
        id: 'delete',
        execute: function () {
          that.deleteApp();
        },
        disabled: true,
        icon: 'helion-icon helion-icon-lg helion-icon-Trash'
      },
      {
        name: gettext('Start'),
        id: 'start',
        execute: function () {
          that.model.startApp(that.cnsiGuid, that.id);
        },
        disabled: true,
        icon: 'helion-icon helion-icon-lg helion-icon-Play'
      },
      {
        name: gettext('CLI Instructions'),
        id: 'cli',
        execute: function () {
        },
        disabled: true,
        icon: 'helion-icon helion-icon-lg helion-icon-Command_line'
      }
    ];

    $scope.$watch(function () {
      return that.model.application.summary.state;
    }, function (newState) {
      that.onAppStateChange(newState);
    });

    $scope.$watch(function () {
      return that.model.application.summary.routes;
    }, function (newRoutes) {
      that.onAppRoutesChange(newRoutes);
    });

    $scope.$on('$destroy', function () {
      that.removeModalStartListener();
      that.removeModalEndListener();
      that.scopeDestroyed = true;
      that.stopUpdate();
    });
  }

  angular.extend(ApplicationController.prototype, {
    init: function () {
      var that = this;
      this.ready = false;
      this.model.application.project = null;
      // Fetching flag onlt set initially - subsequent calls update the data, so we don't want to show a busy indicator
      // in those cases
      this.model.application.pipeline.fetching = true;
      this.model.getClusterWithId(this.cnsiGuid);

      return this.model.getAppSummary(this.cnsiGuid, this.id, true)
        .then(function () {
          that.hideVariables = !that.authModel.isAllowed(that.cnsiGuid,
            that.authModel.resources.application,
            that.authModel.actions.update,
            that.model.application.summary.space_guid
          );

          that.hideDeliveryPipelineData = !that.authModel.isAllowed(that.cnsiGuid,
            that.authModel.resources.application,
            that.authModel.actions.update,
            that.model.application.summary.space_guid
          );
          return that.model.getAppDetailsOnOrgAndSpace(that.cnsiGuid, that.id);
        })
        .then(function () {
          that.model.updateDeliveryPipelineMetadata(true)
            .then(function (response) {
              that.onUpdateDeliveryPipelineMetadata(response);
            });
        })
        .finally(function () {
          that.ready = true;
          // Don't start updating until we have completed the first init
          // Don't create timer when scope has been destroyed
          if (!that.scopeDestroyed) {
            that.startUpdate();
          }
          that.onAppStateChange();
        });
    },

    /**
     * @function startUpdate
     * @description start updating application view
     * @public
     */
    startUpdate: function () {
      var that = this;
      if (!this.scheduledUpdate) {
        this.scheduledUpdate = this.$interval(function () {
          that.update();
        }, this.UPDATE_INTERVAL);
      }
    },

    /**
     * @function stopUpdate
     * @description stop updating application
     * @public
     */
    stopUpdate: function () {
      if (this.scheduledUpdate) {
        this.$interval.cancel(this.scheduledUpdate);
        delete this.scheduledUpdate;
      }
    },

    /**
     * @function update
     * @description update application
     * @public
     */
    update: function () {
      if (this.updating) {
        return;
      }

      var that = this;

      this.updating = true;
      this.$q.when()
        .then(function () {
          that.updateSummary().then(function () {
            that.model.updateDeliveryPipelineMetadata()
              .then(function (response) {
                that.onUpdateDeliveryPipelineMetadata(response);
              });
          });
        })
        .finally(function () {
          that.updating = false;
        });
    },

    /**
     * @function updateSummary
     * @description update application summary
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    updateSummary: function () {
      var that = this;
      return this.model.getAppSummary(this.cnsiGuid, this.id, true).then(function () {
        // Convenience property, rather than verbose html determine which build pack to use here. Also resolves issue
        // where ng-if expressions (with function) were not correctly updating after on scope application.summary
        // changed
        that.appBuildPack = that.model.application.summary.buildpack ||
          that.model.application.summary.detected_buildpack;
      });
    },

    /**
     * @function onUpdateDeliveryPipelineMetadata
     * @description Set project when delivery pipeline metadata is updated
     * @param {object} pipeline - the delivery pipeline data
     * @returns {void}
     * @private
     */
    onUpdateDeliveryPipelineMetadata: function (pipeline) {
      var that = this;
      if (pipeline && pipeline.valid) {
        this.hceCnsi = pipeline.hceCnsi;
        this.hceModel.getProject(this.hceCnsi.guid, pipeline.projectId)
          .then(function (response) {
            var project = response.data;
            if (!_.isNil(project)) {
              // Don't need to fetch VCS data every time if project hasn't changed
              if (_.isNil(that.model.application.project) ||
                  that.model.application.project.id !== project.id) {
                return that.hceModel.getVcs(that.hceCnsi.guid, project.vcs_id)
                  .then(function () {
                    that.model.application.project = project;
                  });
              } else {
                that.model.application.project = project;
              }
            } else {
              that.model.application.project = null;
            }
          });
      } else {
        this.model.application.project = null;
      }
    },

    /**
     * @function updateState
     * @description update application state
     * @returns {promise} A resolved/rejected promise
     * @public
     */
    updateState: function () {
      return this.model.getAppStats(this.cnsiGuid, this.id);
    },

    deleteApp: function () {
      if (this.model.application.summary.services.length || this.model.application.summary.routes.length) {
        var guids = {
          cnsiGuid: this.cnsiGuid,
          hceCnsiGuid: this.hceCnsi ? this.hceCnsi.guid : ''
        };
        this.eventService.$emit('cf.events.START_DELETE_APP_WORKFLOW', guids);
      } else {
        this.simpleDeleteAppDialog();
      }
    },

    simpleDeleteAppDialog: function () {
      var that = this;
      this.confirmDialog({
        title: gettext('Delete Application'),
        description: gettext('Are you sure you want to delete ') + this.model.application.summary.name + '?',
        buttonText: {
          yes: gettext('Delete'),
          no: gettext('Cancel')
        },
        callback: function () {
          var appName = that.model.application.summary.name;
          that.model.deleteApp(that.cnsiGuid, that.id).then(function () {
            // show notification for successful binding
            var successMsg = gettext('"{{appName}}" has been deleted.');
            var message = that.$interpolate(successMsg)({appName: appName});
            that.eventService.$emit('cf.events.NOTIFY_SUCCESS', {message: message});
            that.eventService.$emit(that.eventService.events.REDIRECT, 'cf.applications.list.gallery-view');
          });
        }
      });
    },

    /**
     * @function isActionHidden
     * @description determines if an application action should be hidden
     * @param {string} id - the id of the action
     * @returns {boolean} whether or not the action should be hidden
     */
    isActionHidden: function (id) {

      var hideAction = true;
      if (!this.model.application.state || !this.model.application.state.actions) {
        return true;
      } else if (id === 'launch') {
        hideAction = false;
      } else if (this.authModel.isInitialized(this.cnsiGuid)) {
        // check user is a space developer
        var spaceGuid = this.model.application.summary.space_guid;
        hideAction = !this.authModel.isAllowed(this.cnsiGuid,
          this.authModel.resources.application,
          this.authModel.actions.update,
          spaceGuid);
      }
      return this.model.application.state.actions[id] !== true || hideAction;
    },

    /**
     * @function onAppStateChange
     * @description invoked when the application state changes, so we can update action visibility
     */
    onAppStateChange: function () {
      var that = this;
      angular.forEach(this.appActions, function (appAction) {
        appAction.disabled = false;
        appAction.hidden = that.isActionHidden(appAction.id);
      });
      this.onAppRoutesChange();
    },

    /**
     * @function onAppStateChange
     * @description invoked when the application routes change, so we can update action visibility
     * @param {object} newRoutes - application route metadata
     */
    onAppRoutesChange: function (newRoutes) {
      // Must have a route to be able to view an application
      var viewAction = _.find(this.appActions, {id: 'launch'});
      var hidden = this.isActionHidden(viewAction.id);
      if (!hidden) {
        var routes = _.isNil(newRoutes) ? this.model.application.summary.routes : newRoutes;
        hidden = _.isNil(routes) || routes.length === 0;
      }
      viewAction.hidden = hidden;
    }
  });

})();
