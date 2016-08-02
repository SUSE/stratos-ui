(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.summary', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.summary', {
      url: '/summary',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/summary/summary.html',
      controller: ApplicationSummaryController,
      controllerAs: 'applicationSummaryCtrl'
    });
  }

  ApplicationSummaryController.$inject = [
    'app.model.modelManager',
    'app.service.serviceManager',
    '$stateParams',
    'cloud-foundry.view.applications.application.summary.addRoutes',
    'cloud-foundry.view.applications.application.summary.editApp',
    'app.utils.utilsService'
  ];

  /**
   * @name ApplicationSummaryController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.service.serviceManager} serviceManager - the Service management service
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {cloud-foundry.view.applications.application.summary.addRoutes} addRoutesService - add routes service
   * @param {cloud-foundry.view.applications.application.summary.editapp} editAppService - edit Application
   * @property {cloud-foundry.model.application} model - the Cloud Foundry Applications Model
   * @property {app.model.serviceInstance.user} userCnsiModel - the user service instance model
   * @property {string} id - the application GUID
   * @property {cloud-foundry.view.applications.application.summary.addRoutes} addRoutesService - add routes service
   * @property {helion.framework.widgets.dialog.confirm} confirmDialog - the confirm dialog service
   * @param {app.model.utilsService} utils - the utils service
   * @property {app.model.utilsService} utils - the utils service
   */
  function ApplicationSummaryController(modelManager, serviceManager, $stateParams, addRoutesService, editAppService, utils) {
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.routesService = serviceManager.retrieve('cloud-foundry.service.route');
    this.id = $stateParams.guid;
    this.cnsiGuid = $stateParams.cnsiGuid;
    this.addRoutesService = addRoutesService;
    this.editAppService = editAppService;
    this.userCnsiModel.list();
    this.utils = utils;

    this.instanceViewLimit = 5;

    var that = this;
    this.routesActionMenu = [
      {
        name: gettext('Unmap from App'),
        execute: function (route) {
          that.routesService.unmapRoute(that.cnsiGuid, route, route.guid, that.id);
        }
      },
      {
        name: gettext('Delete Route'),
        execute: function (route) {
          that.routesService.deleteRoute(that.cnsiGuid, route, route.guid);
        }
      }
    ];
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
      this.addRoutesService.add();
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
      return this.utils.getClusterEndpoint(this.userCnsiModel.serviceInstances[this.cnsiGuid]);
    },

    /**
     * @function formatUptime
     * @description format an uptime in seconds into a days, hours, minutes, seconds string
     * @param {number} uptime in seconsd
     * @returns {string} formatted uptime string
     */
    formatUptime: function (uptime) {
      if (angular.isUndefined(uptime) || uptime === null) {
        return '-';
      }
      if (uptime === 0) {
        return '0 ' + gettext('seconds');
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
          return count + ' ' + single + ' ';
        } else {
          return count + ' ' + plural + ' ';
        }
      }

      return (formatPart(days, gettext('day'), gettext('days')) +
        formatPart(hours, gettext('hour'), gettext('hours')) +
        formatPart(minutes, gettext('minute'), gettext('minutes')) +
        formatPart(seconds, gettext('second'), gettext('seconds'))).trim();
    }
  });

})();
