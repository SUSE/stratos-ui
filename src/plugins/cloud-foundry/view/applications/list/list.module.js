(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.list', [
      'cloud-foundry.view.applications.list.gallery-view',
      'cloud-foundry.view.applications.list.table-view'
    ])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.list', {
      url: '/list',
      templateUrl: 'plugins/cloud-foundry/view/applications/list/list.html',
      controller: ApplicationsListController,
      controllerAs: 'applicationsListCtrl'
    });
  }

  ApplicationsListController.$inject = [
    'app.model.modelManager',
    'app.event.eventService'
  ];

  /**
   * @name ApplicationsListController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.event.eventService} eventService - the event bus service
   * @property {app.model.modelManager} modelManager - the Model management service
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {app.event.eventService} eventService - the event bus service
   */
  function ApplicationsListController(modelManager, eventService) {
    var that = this;
    this.modelManager = modelManager;
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.eventService = eventService;
    this.ready = false;
    this.hasApps = false;
    this.clusters = [{label: 'All Clusters', value: 'all'}];
    this.organizations = [{label: 'All Organizations', value: 'all'}];
    this.spaces = [{label: 'All Spaces', value: 'all'}];
    this.filter = {
      cnsiGuid: 'all',
      orgGuid: 'all',
      spaceGuid: 'all'
    };
    this.clusterCount = 0;
    this.userCnsiModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.userCnsiModel.list().then(function () {
      that._setClusters();
      that._setOrgs();
      that._setSpaces();
      that._getApps();
    });
  }

  angular.extend(ApplicationsListController.prototype, {
    /**
     * @function _setClusters
     * @description Set the cluster filter list
     * @returns {void}
     * @private
     */
    _setClusters: function () {
      // get the list of connected HCF clusters
      this.clusters.length = 1;
      var clusters = _.chain(this.userCnsiModel.serviceInstances)
                      .values()
                      .filter({cnsi_type: 'hcf'})
                      .map(function (o) {
                        return {label: o.name, value: o.guid};
                      })
                      .value();
      [].push.apply(this.clusters, clusters);
      this.clusterCount = clusters.length;

      if (this.model.filterParams.cnsiGuid !== 'all') {
        this.filter.cnsiGuid = this.model.filterParams.cnsiGuid;
      }
    },

    /**
     * @function _setOrgs
     * @description Set the org filter list
     * @returns {promise} A promise
     * @private
     */
    _setOrgs: function () {
      var that = this;
      if (this.model.filterParams.cnsiGuid !== 'all') {
        var orgModel = this.modelManager.retrieve('cloud-foundry.model.organization');
        return orgModel.listAllOrganizations(this.model.filterParams.cnsiGuid)
          .then(function (newOrgs) {
            var orgs = _.map(newOrgs, that._selectMapping);
            [].push.apply(that.organizations, orgs);

            if (that.model.filterParams.orgGuid !== 'all') {
              that.filter.orgGuid = that.model.filterParams.orgGuid;
            }
          });
      }
    },

    /**
     * @function _setSpaces
     * @description Set the space filter list
     * @returns {promise} A promise
     * @private
     */
    _setSpaces: function () {
      var that = this;
      if (this.model.filterParams.cnsiGuid !== 'all' &&
          this.model.filterParams.orgGuid !== 'all') {
        var orgModel = this.modelManager.retrieve('cloud-foundry.model.organization');
        return orgModel.listAllSpacesForOrganization(
            this.model.filterParams.cnsiGuid,
            this.model.filterParams.orgGuid
          )
          .then(function (newSpaces) {
            var spaces = _.map(newSpaces, that._selectMapping);
            [].push.apply(that.spaces, spaces);

            if (that.model.filterParams.spaceGuid !== 'all') {
              that.filter.spaceGuid = that.model.filterParams.spaceGuid;
            }
          });
      }
    },

    /**
     * @function _setFilter
     * @description Set filter in application model and this module
     * @param {object} updatedFilter - the updated filter
     * @returns {void}
     * @private
     */
    _setFilter: function (updatedFilter) {
      angular.extend(this.model.filterParams, updatedFilter);
      angular.extend(this.filter, updatedFilter);
    },

    /**
     * @function _getApps
     * @description Retrieve apps
     * @returns {void}
     * @public
     */
    _getApps: function () {
      var that = this;
      this.model.all().finally(function () {
        // Check the data we have and determine if we have any applications
        that.hasApps = false;
        if (that.clusterCount > 0 && that.model.data && that.model.data.applications) {
          var appCount = _.reduce(that.model.data.applications, function (sum, app) {
            if (!app.error && app.resources) {
              return sum + app.resources.length;
            } else {
              return sum;
            }
          }, 0);
          that.hasApps = appCount > 0;
        }
        that.ready = true;
      });
    },

    /**
     * @function getClusterOrganizations
     * @description Get organizations for selected cluster
     * @returns {void}
     * @public
     */
    setCluster: function () {
      this.organizations.length = 1;
      this.model.filterParams.cnsiGuid = this.filter.cnsiGuid;
      this._setFilter({orgGuid: 'all', spaceGuid: 'all'});
      this._getApps();
      this._setOrgs();
    },

    /**
     * @function getOrganizationSpaces
     * @description Get spaces for selected organization
     * @returns {void}
     * @public
     */
    setOrganization: function () {
      this.spaces.length = 1;
      this.model.filterParams.orgGuid = this.filter.orgGuid;
      this._setFilter({spaceGuid: 'all'});
      this._getApps();
      this._setSpaces();
    },

    setSpace: function () {
      this.model.filterParams.spaceGuid = this.filter.spaceGuid;
      this._getApps();
    },

    /**
     * @function resetFilter
     * @description Reset the filter to all
     * @returns {void}
     * @public
     */
    resetFilter: function () {
      this._setFilter({cnsiGuid: 'all'});
      this.setCluster();
    },

    /**
     * @function _selectMapping
     * @description Select mapping for select input options
     * @param {object} obj - the object to get mapping for
     * @returns {object} Select input option mapping
     * @private
     */
    _selectMapping: function (obj) {
      return {
        label: obj.entity.name,
        value: obj.metadata.guid
      };
    }
  });

})();
