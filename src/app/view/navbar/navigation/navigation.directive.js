(function () {
  'use strict';

  angular
    .module('app.view')
    .directive('navigation', navigation);

  /**
   * @namespace app.view.navigation
   * @memberof app.view
   * @name navigation
   * @description A navigation UI component directive
   * @param {string} appBasePath - the application base path
   * @returns {object} The navigation directive definition object
   */
  function navigation(appBasePath) {
    return {
      controller: NavigationController,
      controllerAs: 'navigationCtrl',
      templateUrl: appBasePath + 'view/navbar/navigation/navigation.html'
    };
  }

  /**
   * @namespace app.view.NavigationController
   * @memberof app.view
   * @name NavigationController
   * @constructor
   * @param {app.model.modelManager} modelManager - the application model manager
   * @property {app.model.navigationModel} navigationModel - the navigation model
   */
  function NavigationController(modelManager) {
    this.navigationModel = modelManager.retrieve('app.model.navigation');

    // For Bootrap: Hide the responsive nav menu when a user clicks on an item in it

    /* eslint-disable angular/angularelement */
    var navMain = $('#navbar');
    navMain.on('click', 'a', null, function () {
      navMain.collapse('hide');
    });
    /* eslint-enable angular/angularelement */

  }
})();
