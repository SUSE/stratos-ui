(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster', [
      'app.view.endpoints.clusters.cluster.detail',
      'app.view.endpoints.clusters.cluster.organization',
      'ncy-angular-breadcrumb'
    ])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters.cluster', {
      url: '/:guid',
      abstract: true,
      templateUrl: 'app/view/endpoints/clusters/cluster/cluster.html',
      controller: ClusterController,
      controllerAs: 'clusterController'
    });
  }

  ClusterController.$inject = [
    '$stateParams',
    '$log',
    'app.utils.utilsService',
    '$state',
    '$q',
    'app.model.modelManager'
  ];

  function ClusterController($stateParams, $log, utils, $state, $q, modelManager) {
    var that = this;
    var organizationModel = modelManager.retrieve('cloud-foundry.model.organization');
    var serviceBindingModel = modelManager.retrieve('cloud-foundry.model.service-binding');
    var appModel = modelManager.retrieve('cloud-foundry.model.application');
    var stackatoInfoModel = modelManager.retrieve('app.model.stackatoInfo');

    this.initialized = false;
    this.guid = $stateParams.guid;
    this.userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');

    this.getEndpoint = function () {
      return utils.getClusterEndpoint(that.userServiceInstanceModel.serviceInstances[that.guid]);
    };

    function init() {

      // Cache all organizations associated with this cluster
      var orgPromise = organizationModel.listAllOrganizations(that.guid, {}).then(function (orgs) {
        var allDetailsP = [];
        _.forEach(orgs, function (org) {
          var orgDetailsP = organizationModel.getOrganizationDetails(that.guid, org).catch(function () {
            // Swallow errors for individual orgs
            $log.error('Failed to fetch details for org - ' + org.entity.name);
          });
          allDetailsP.push(orgDetailsP);
        });
        return $q.all(allDetailsP).then(function (val) {
          that.organizationNames = organizationModel.organizationNames[that.guid];
          return val;
        });
      }).catch(function (error) {
        $log.error('Error while listing organizations', error);
      });

      /* eslint-disable no-warning-comments */
      // TODO (TEAMFOUR-780): There's a few places we call this for the core endpoints screens (before we hit a specific
      // clusters page). Need to reduce all these calls to one and watch cache.
      // Cache all user service instance data. Also used by child states to determine cluster name in breadcrumbs
      /* eslint-enable no-warning-comments */
      var servicesPromise = that.userServiceInstanceModel.list();

      // Needed to show a Space's list of service instances (requires app name, from app guid, from service binding)
      var serviceBindingPromise = serviceBindingModel.listAllServiceBindings(that.guid);
      
      var stackatoInfoPromise = stackatoInfoModel.getStackatoInfo();

      // Reset any cache we may be interested in
      delete appModel.appSummary;

      return $q.all([
        orgPromise,
        servicesPromise,
        serviceBindingPromise,
        stackatoInfoPromise])
        .finally(function () {
          that.initialized = true;
        });
    }

    utils.chainStateResolve('endpoint.clusters.cluster', $state, init);
  }

})();
