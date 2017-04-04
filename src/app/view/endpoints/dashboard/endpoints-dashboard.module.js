(function () {
  'use strict';

  angular
    .module('app.view.endpoints.dashboard', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.dashboard', {
      url: '',
      templateUrl: 'app/view/endpoints/dashboard/endpoints-dashboard.html',
      controller: EndpointsDashboardController,
      controllerAs: 'endpointsDashboardCtrl',
      ncyBreadcrumb: {
        label: gettext('Endpoints')
      }
    });
  }

  EndpointsDashboardController.$inject = [
    '$q',
    '$scope',
    '$state',
    'modelManager',
    'appUtilsService',
    'app.view.registerService',
    'app.view.endpoints.dashboard.dashboardService',
    'app.view.endpoints.dashboard.cnsiService',
    'app.view.endpoints.dashboard.vcsService'
  ];

  /**
   * @namespace app.view.endpoints.dashboard
   * @memberof app.view.endpoints.dashboard
   * @name EndpointsDashboardController
   * @param {object} $q - the Angular $q service
   * @param {object} $scope - the angular scope service
   * @param {object} $state - the UI router $state service
   * @param {app.model.modelManager} modelManager - the application model manager
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {app.view.registerService} registerService register service to display the core slide out
   * @param {app.view.endpoints.dashboard.dashboardService} dashboardService - service to support endpoints dashboard
   * @param {app.view.endpoints.dashboard.cnsiService} cnsiService - service to support dashboard with cnsi type endpoints
   * @param {app.view.endpoints.dashboard.vcsService} vcsService - service to support dashboard with vcs type endpoints
   * @constructor
   */
  function EndpointsDashboardController($q, $scope, $state, modelManager, appUtilsService, registerService,
                                        dashboardService, cnsiService, vcsService) {
    var that = this;

    var currentUserAccount = modelManager.retrieve('app.model.account');

    var endpointsProviders = [cnsiService, vcsService];

    this.endpoints = dashboardService.endpoints;
    dashboardService.clear();

    /*
     * Call method on all service providers, forwarding the passed arguments
     * If the called method returns a promise, we return a $q.all() on all the returned promises,
     * otherwise we return an array of the returned values
     * */
    function callForAllProviders(method) {
      Array.prototype.shift.apply(arguments);

      var values = [];
      var isPromise = null;

      for (var i = 0; i < endpointsProviders.length; i++) {
        if (!angular.isFunction(endpointsProviders[i][method])) {
          throw new Error('callForAllProviders: service provider does not implement method: ' + method);
        }
        var ret = endpointsProviders[i][method].apply(this, arguments);
        if (ret && angular.isFunction(ret.then)) {
          if (isPromise === null) {
            isPromise = true;
          } else if (!isPromise) {
            throw new Error('callForAllProviders: Cannot mix promise and value returning functions');
          }
          values.push(ret);
        } else {
          if (isPromise === null) {
            isPromise = false;
          } else if (isPromise) {
            throw new Error('callForAllProviders: Cannot mix promise and value returning functions');
          }
          values.push(ret);
        }
      }
      if (isPromise) {
        return $q.all(values);
      }
      return values;
    }

    this.initialised = false;
    this.listError = false;

    // Ensure any app errors we have set are cleared when the scope is destroyed
    $scope.$on('$destroy', function () {
      callForAllProviders('clear');
    });

    /**
     * @namespace app.view.endpoints.dashboard
     * @memberof app.view.endpoints.dashboard
     * @name register
     * @description Register a service endpoint
     */
    this.register = function () {
      registerService.show($scope).then(function () {
        _updateEndpoints();
      });
    };

    /**
     * @namespace app.view.endpoints.dashboard
     * @memberof app.view.endpoints.dashboard
     * @name hideWelcomeMessage
     * @description Hide Welcome message
     */
    this.hideWelcomeMessage = function () {
      this.showWelcomeMessage = false;
    };

    /**
     * @function isUserAdmin
     * @memberOf app.view.endpoints.dashboard
     * @description Is current user an admin?
     * @returns {Boolean}
     */
    this.isUserAdmin = function () {
      return currentUserAccount.isAdmin();
    };

    /**
     * @function reload
     * @memberOf app.view.endpoints.dashboard
     * @description Reload the current view (used if there was an error loading the dashboard)
     */
    this.reload = function () {
      $state.reload();
    };

    function init() {
      _updateEndpoints().then(function () {
        _updateWelcomeMessage();
      });
    }

    appUtilsService.chainStateResolve('endpoint.dashboard', $state, init);

    function _updateWelcomeMessage() {
      // Show the welcome message if either...
      if (that.isUserAdmin()) {
        // The user is admin and there are no endpoints registered
        that.showWelcomeMessage = that.endpoints.length === 0;
      } else {
        // The user is not admin and there are no connected endpoints (note - they should never reach here if there
        // are no registered endpoints)
        that.showWelcomeMessage = !_.find(that.endpoints, { connected: 'connected' });
      }
    }

    function _haveCachedEndpoints() {
      var ret = callForAllProviders('haveInstances');
      for (var i = 0; i < ret.length; i++) {
        if (ret[i]) {
          return true;
        }
      }
      return false;
    }

    function _updateEndpointsFromCache() {
      callForAllProviders('createEndpointEntries');
      _updateWelcomeMessage();

      // Pre-sort the array to avoid initial smart-table flicker
      that.endpoints.sort(function (e1, e2) {
        return e1.type !== e2.type ? e1.type.localeCompare(e2.type) : e1.name.localeCompare(e2.name);
      });

      that.initialised = true;
    }

    /**
     * @function _updateEndpoints
     * @memberOf app.view.endpoints.dashboard
     * @description update the models supporting the endpoints dashboard and refresh the local endpoints list
     * @returns {object} a promise
     * @private
     */
    function _updateEndpoints() {
      return callForAllProviders('updateInstances')
        .then(function () {
          that.listError = false;
        })
        .catch(function () {
          that.listError = true;
        })
        .then(function () {
          return dashboardService.refreshCodeEngineVcses();
        })
        .then(function () {
          _updateEndpointsFromCache();
        })
        .finally(function () {
          that.intialised = true;
        });
    }

    if (_haveCachedEndpoints()) {
      // serviceInstanceModel has previously been updated
      // to decrease load time, we will use that data.
      // we will still refresh the data asynchronously and the UI will update to reflect changes
      _updateEndpointsFromCache();
    }
  }

})();
