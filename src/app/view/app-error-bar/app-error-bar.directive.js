(function () {
  'use strict';

  angular
    .module('app.view')
    .directive('appErrorBar', appErrorBar);

  /**
   * @namespace app.view.clusterRegistration
   * @memberof app.view
   * @name clusterRegistration
   * @description A cluster-registration directive
   * @param {string} appBasePath - the application base path
   * @returns {object} The cluster-registration directive definition object
   */
  function appErrorBar(appBasePath) {
    return {
      bindToController: {
        displayed: '='
      },
      controller: AppErrorBarController,
      controllerAs: 'appErrorBarCtrl',
      templateUrl: appBasePath + 'view/app-error-bar/app-error-bar.html',
      scope: {}
    };
  }

  /**
   * @name AppErrorBarController
   * @memberof app.view
   * @description Controller for the Application Error Bar directive
   * @constructor
   * @param {object} $scope - the Angular $scope
   * @param {app.event.appEventEventService} appEventEventService - the event Service
   * @property {app.event.appEventEventService} appEventEventService - the event Service
   * @property {string} messgae - the error message to display
   */
  function AppErrorBarController($scope, appEventEventService) {
    var that = this;
    this.appEventEventService = appEventEventService;
    this.message = undefined;
    this.displayed = false;

    this.removeSetListener = appEventEventService.$on(appEventEventService.events.APP_ERROR_NOTIFY, function (ev, msg) {
      that.message = msg;
      that.displayed = true;
    });

    this.removeClearListener = appEventEventService.$on(appEventEventService.events.APP_ERROR_CLEAR, function () {
      that.displayed = false;
      that.message = undefined;
    });

    $scope.$on('$destroy', function () {
      that.removeSetListener();
      delete that.removeSetListener;
      that.removeClearListener();
      delete that.removeClearListener;
    });
  }
})();
