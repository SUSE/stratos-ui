(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.summary', [])
    .config(registerRoute)
    .run(registerAppTab);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.summary', {
      url: '/summary',
      params: {
        newlyCreated: false
      },
      templateUrl: 'plugins/cloud-foundry/view/applications/application/summary/summary.html',
      controller: ApplicationSummaryController,
      controllerAs: 'applicationSummaryCtrl'
    });
  }

  function registerAppTab(cfApplicationTabs) {
    cfApplicationTabs.tabs.push({
      position: 1,
      hide: false,
      uiSref: 'cf.applications.application.summary',
      label: 'app.tabs.summary.label'
    });
  }

  ApplicationSummaryController.$inject = [
    '$state',
    '$stateParams',
    '$log',
    '$q',
    '$scope',
    '$filter',
    'modelManager',
    'cloud-foundry.view.applications.application.summary.addRoutes',
    'cloud-foundry.view.applications.application.summary.editApp',
    'appUtilsService',
    'appClusterRoutesService',
    'frameworkDialogConfirm',
    'appNotificationsService'
  ];

  /**
   * @name ApplicationSummaryController
   * @constructor
   * @param {object} $state - UI Router $state
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $log - the angular $log service
   * @param {object} $q - the angular $q service
   * @param {object} $scope - the Angular $scope service
   * @param {object} $filter - the Angular $filter service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {cloud-foundry.view.applications.application.summary.addRoutes} addRoutesService - add routes service
   * @param {cloud-foundry.view.applications.application.summary.editapp} editAppService - edit Application
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {appClusterRoutesService} appClusterRoutesService - the Service management service
   * @param {helion.framework.widgets.dialog.frameworkDialogConfirm} frameworkDialogConfirm - the confirm dialog service
   * @param {app.view.appNotificationsService} appNotificationsService - the toast notification service
   * @property {cloud-foundry.model.application} model - the Cloud Foundry Applications Model
   * @property {app.model.serviceInstance.user} userCnsiModel - the user service instance model
   * @property {string} id - the application GUID
   * @property {cloud-foundry.view.applications.application.summary.addRoutes} addRoutesService - add routes service
   * @property {helion.framework.widgets.dialog.frameworkDialogConfirm} frameworkDialogConfirm - the confirm dialog service
   * @property {appUtilsService} appUtilsService - the appUtilsService service
   * @property {appNotificationsService} appNotificationsService - the toast notification service
   */
  function ApplicationSummaryController($state, $stateParams, $log, $q, $scope, $filter,
                                        modelManager, addRoutesService, editAppService, appUtilsService,
                                        appClusterRoutesService, frameworkDialogConfirm, appNotificationsService) {

    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.authModel = modelManager.retrieve('cloud-foundry.model.auth');
    this.appClusterRoutesService = appClusterRoutesService;
    this.id = $stateParams.guid;
    this.cnsiGuid = $stateParams.cnsiGuid;
    this.addRoutesService = addRoutesService;
    this.editAppService = editAppService;
    this.frameworkDialogConfirm = frameworkDialogConfirm;
    this.appNotificationsService = appNotificationsService;
    this.appUtilsService = appUtilsService;
    this.$log = $log;
    this.$q = $q;
    this.instanceViewLimit = 5;

    this.update = function () {
      return this.appCtrl.update();
    };

    // Show a "suggested next steps" if this app is newly created (transitionned from add app flow)
    this.newlyCreated = $stateParams.newlyCreated;

    // Hide these options by default until we can ascertain that user can perform them
    this.hideAddRoutes = true;
    this.hideEditApp = true;
    this.hideManageServices = true;

    var that = this;
    this.routesActionMenu = [
      {
        name: gettext('Unmap from App'),
        disabled: false,
        execute: function (route) {
          appClusterRoutesService.unmapAppRoute(that.cnsiGuid, route, route.guid, that.id).finally(function () {
            that.update();
          });
        }
      },
      {
        name: gettext('Delete Route'),
        disabled: false,
        execute: function (route) {
          appClusterRoutesService.deleteRoute(that.cnsiGuid, route, route.guid).finally(function () {
            that.update();
          });
        }
      }
    ];

    this.instancesActionMenu = [
      {
        name: gettext('Terminate'),
        disabled: false,
        execute: function (instanceIndex) {
          that.frameworkDialogConfirm({
            title: gettext('Terminate Instance'),
            description: gettext('Are you sure you want to terminate Instance ') + instanceIndex + '?',
            errorMessage: gettext('There was a problem terminating this instance. Please try again. If this error persists, please contact the Administrator.'),
            submitCommit: true,
            buttonText: {
              yes: gettext('Terminate'),
              no: gettext('Cancel')
            },
            callback: function () {
              return that.model.terminateRunningAppInstanceAtGivenIndex(that.cnsiGuid, that.id, instanceIndex)
                .then(function () {
                  that.appNotificationsService.notify('success', gettext('Instance successfully terminated'));
                  that.update();
                });
            }
          });
        }
      }
    ];

    function init() {
      $scope.$watchCollection(function () {
        return that.model.application.summary.services;
      }, function () {
        // Filter out the stackato hce service
        that.serviceInstances = $filter('removeHceServiceInstance')(that.model.application.summary.services, that.id);
      });

      that.canSetupPipeline = _.filter(that.userCnsiModel.serviceInstances, {cnsi_type: 'hce', valid: true}).length;

      // Unmap from app
      that.routesActionMenu[0].hidden = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.application,
        that.authModel.actions.update,
        that.model.application.summary.space_guid
      );
      that.$log.debug('Auth Action: Unmap from app hidden: ' + that.routesActionMenu[0].hidden);
      // delete route
      that.routesActionMenu[1].hidden = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.route,
        that.authModel.actions.delete,
        that.model.application.summary.space_guid
      );
      that.$log.debug('Auth Action: Delete from app hidden: ' + that.routesActionMenu[1].hidden);
      that.hideRouteActions = !_.find(that.routesActionMenu, { hidden: false });

      // hide Add Routes
      that.hideAddRoutes = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.route,
        that.authModel.actions.create, that.model.application.summary.space_guid);
      that.$log.debug('Auth Action: Hide Add routes hidden: ' + that.hideAddRoutes);

      // hide Edit App
      that.hideEditApp = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.application,
        that.authModel.actions.update, that.model.application.summary.space_guid);
      that.$log.debug('Auth Action: Hide Edit App hidden: ' + that.hideEditApp);

      // hide Manage Services
      that.hideManageServices = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.managed_service_instance,
        that.authModel.actions.create, that.model.application.summary.space_guid);
      that.$log.debug('Auth Action: Hide Manage Services hidden: ' + that.hideEditApp);

      // Terminate instance action
      that.instancesActionMenu[0].hidden = !that.authModel.isAllowed(that.cnsiGuid,
        that.authModel.resources.application,
        that.authModel.actions.update, that.model.application.summary.space_guid);
      that.hideInstanceActions = !_.find(that.instancesActionMenu, { hidden: false });

      return that.$q.resolve();
    }

    this.appUtilsService.chainStateResolve('cf.applications.application.summary', $state, init);

  }

  angular.extend(ApplicationSummaryController.prototype, {
    /**
     * @function isWebLink
     * @description Determine if supplies buildpack url is a web link
     * @param {string} buildpack - buildpack url guid
     * @returns {boolean} Indicating if supplies buildpack is a web link
     * @public
     **/
    isWebLink: function (buildpack) {
      var url = angular.isDefined(buildpack) && buildpack !== null ? buildpack : '';
      url = url.trim().toLowerCase();
      return url.indexOf('http://') === 0 || url.indexOf('https://') === 0;
    },

    /**
     * @function showAddRouteForm
     * @description Show Add a Route form
     * @public
     **/
    showAddRouteForm: function () {
      this.addRoutesService.add(this.cnsiGuid, this.id);
    },

    /**
     * @function editApp
     * @description Display edit app detail view
     * @public
     */
    editApp: function () {
      this.editAppService.display(this.cnsiGuid, this.id);
    },

    getEndpoint: function () {
      return this.appUtilsService.getClusterEndpoint(this.userCnsiModel.serviceInstances[this.cnsiGuid]);
    },

    /**
     * @function formatUptime
     * @description format an uptime in seconds into a days, hours, minutes, seconds string
     * @param {number} uptime in seconds
     * @returns {string} formatted uptime string
     */
    formatUptime: function (uptime) {
      if (angular.isUndefined(uptime) || uptime === null) {
        return '-';
      }
      if (uptime === 0) {
        return '0' + gettext('s');
      }
      var days = Math.floor(uptime / 86400);
      uptime = uptime % 86400;
      var hours = Math.floor(uptime / 3600);
      uptime = uptime % 3600;
      var minutes = Math.floor(uptime / 60);
      var seconds = uptime % 60;

      function formatPart(count, single, plural) {
        if (count === 0) {
          return '';
        } else if (count === 1) {
          return count + single + ' ';
        } else {
          return count + plural + ' ';
        }
      }

      return (formatPart(days, gettext('d'), gettext('d')) +
      formatPart(hours, gettext('h'), gettext('h')) +
      formatPart(minutes, gettext('m'), gettext('m')) +
      formatPart(seconds, gettext('s'), gettext('s'))).trim();
    }
  });

})();
