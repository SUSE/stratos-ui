(function () {
  'use strict';

  angular
    .module('app.view.endpoints.dashboard', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute ($stateProvider) {
    $stateProvider.state('endpoints.dashboard', {
      url: '',
      templateUrl: 'app/view/endpoints/dashboard/endpoints-dashboard.html',
      controller: EndpointsDashboardController,
      controllerAs: 'endpointsDashboardCtrl'
    });
  }

  EndpointsDashboardController.$inject = [
    'app.model.modelManager',
    '$state',
    'app.view.hceRegistration',
    'app.view.hcfRegistration',
    '$q'
  ];

  /**
   * @namespace app.view.endpoints.hce
   * @memberof app.view.endpoints.hce
   * @name EndpointsDashboardController
   * @param {app.model.modelManager} modelManager - the application model manager
   * @param {object} $state - the UI router $state service
   * @param {app.view.hceRegistration} hceRegistration - HCE Registration detail view service
   * @param {app.view.hcfRegistration} hcfRegistration - HCF Registration detail view service
   * @param $q
   * @constructor
   */
  function EndpointsDashboardController (modelManager, $state, hceRegistration, hcfRegistration, $q) {

    this.modelManager = modelManager;
    this.serviceInstanceModel = modelManager.retrieve('app.model.serviceInstance');
    this.userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.currentUserAccount = modelManager.retrieve('app.model.account');
    this.$state = $state;
    this.hceRegistration = hceRegistration;
    this.hcfRegistration = hcfRegistration;
    this.listPromiseResolved = false;

    this.serviceInstances = {};
    if (this.serviceInstanceModel.serviceInstances > 0) {
      // serviceInstanceModel has previously been updated
      // to decrease load time, we will use that data.
      this.listPromiseResolved = true;
      this._updateLocalServiceInstances();
    }
    // Show welcome message only if no endpoints are registered
    this.showWelcomeMessage = this.serviceInstanceModel.serviceInstances.length === 0;
    this.serviceInstanceModel.list();
    this.$q = $q;

    this._updateEndpoints();

  }

  angular.extend(EndpointsDashboardController.prototype, {

    /**
     * @namespace app.view.endpoints.dashboard
     * @memberof app.view.endpoints.dashboard
     * @name showClusterAddForm
     * @description Show cluster add form
     * @param {Bool} isHcf
     */
    showClusterAddForm: function (isHcf) {
      var that = this;
      if (isHcf) {
        this.hcfRegistration.add()
          .then(function () {
            return that._updateEndpoints;
          });
      } else {
        this.hceRegistration.add()
          .then(function () {
            return that._updateEndpoints;
          });
      }
    },

    /**
     * @namespace app.view.endpoints.dashboard
     * @memberof app.view.endpoints.dashboard
     * @name hideWelcomeMessage
     * @description Hide Welcome message
     */
    hideWelcomeMessage: function () {
      this.showWelcomeMessage = false;
    },

    /**
     * @function isUserAdmin
     * @memberOf app.view.endpoints.dashboard
     * @description Is current user an admin?
     * @returns {Boolean}
     */
    isUserAdmin: function () {
      return this.currentUserAccount.isAdmin();
    },

    /**
     * @function _updateLocalServiceInstances
     * @memberOf app.view.endpoints.dashboard
     * @description Updates local service instances
     * @private
     */
    _updateLocalServiceInstances: function () {
      var that = this;
      if (this.showWelcomeMessage && this.serviceInstanceModel.serviceInstances.length > 0) {
        this.showWelcomeMessage = false;
      }
      _.forEach(this.serviceInstanceModel.serviceInstances, function (serviceInstance) {
        var guid = serviceInstance.guid;
        if (angular.isUndefined(that.serviceInstances[guid])) {
          that.serviceInstances[guid] = serviceInstance;
        } else {
          angular.extend(that.serviceInstances[guid], serviceInstance);
        }
      });
    }, /**
     * @function _updateEndpoints
     * @memberOf app.view.endpoints.dashboard
     * @description Is current user an admin?
     * @returns {*}
     * @private
     */
    _updateEndpoints: function () {

      var that = this;
      return this.$q.all([this.serviceInstanceModel.list(), this.userServiceInstanceModel.list()])
        .then(function () {
          that._updateLocalServiceInstances();
        }).then(function () {
          that.listPromiseResolved = true;
        });
    }
  });

})();
