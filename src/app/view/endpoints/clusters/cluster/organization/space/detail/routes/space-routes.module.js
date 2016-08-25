(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster.organization.space.detail.routes', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('endpoint.clusters.cluster.organization.space.detail.routes', {
      url: '/routes',
      templateUrl: 'app/view/endpoints/clusters/cluster/organization/space/detail/routes/space-routes.html',
      controller: SpaceRoutesController,
      controllerAs: 'spaceRoutesCtrl',
      ncyBreadcrumb: {
        label: '{{ clusterSpaceController.space().details.entity.name || "..." }}',
        parent: function () {
          return 'endpoint.clusters.cluster.organization.detail.spaces';
        }
      }
    });
  }

  SpaceRoutesController.$inject = [
    '$scope',
    '$stateParams',
    '$q',
    '$log',
    '$state',
    'app.model.modelManager',
    'app.view.endpoints.clusters.routesService',
    'app.utils.utilsService'
  ];

  function SpaceRoutesController($scope, $stateParams, $q, $log, $state, modelManager, routesService, utils) {
    var that = this;
    this.clusterGuid = $stateParams.guid;
    this.organizationGuid = $stateParams.organization;
    this.spaceGuid = $stateParams.space;
    this.$q = $q;
    this.$log = $log;
    this.modelManager = modelManager;
    this.routesService = routesService;

    this.spaceModel = modelManager.retrieve('cloud-foundry.model.space');
    this.spacePath = this.spaceModel.fetchSpacePath(this.clusterGuid, this.spaceGuid);

    this.apps = {};
    this.actionsPerRoute = {};
    this.authService = modelManager.retrieve('cloud-foundry.model.auth');

    $scope.$watch(function () {
      return that.visibleRoutes &&
        that.authService.isInitialized();
    }, function (routes) {

      routes = that.visibleRoutes;
      if (!routes) {
        return;
      }
      that.updateActions(routes);
    });
  }

  angular.extend(SpaceRoutesController.prototype, {

    getInitialActions: function () {
      var that = this;
      return [
        {
          name: gettext('Delete Route'),
          disabled: false,
          execute: function (route) {
            that.routesService.deleteRoute(that.clusterGuid, route.entity, route.metadata.guid)
              .then(function () {
                return that.spaceModel.listAllRoutesForSpace(that.clusterGuid, that.spaceGuid);
              })
              .then(function () {
                that.updateActions([route]);
              });
          }
        },
        {
          name: gettext('Unmap Route'),
          disabled: true,
          execute: function (route) {
            var promise;
            if (route.entity.apps.length > 1) {
              promise = that.routesService.unmapAppsRoute(that.clusterGuid, route.entity, route.metadata.guid,
                _.map(route.entity.apps, 'metadata.guid'));
            } else {
              promise = that.routesService.unmapAppRoute(that.clusterGuid, route.entity, route.metadata.guid,
                route.entity.apps[0].metadata.guid);
            }
            promise.then(function (changeCount) {
              if (changeCount < 1) {
                return;
              }
              that.spaceModel.listAllRoutesForSpace(that.clusterGuid, that.spaceGuid).then(function () {
                that.updateActions([route]);
              });
            });

          }
        }
      ];
    },

    appsToNames: function (apps) {
      return _.map(apps, function (app) {
        return app.entity.name;
      });
    },

    updateActions: function (routes) {
      var that = this;
      _.forEach(routes, function (route) {
        that.actionsPerRoute[route.metadata.guid] = that.actionsPerRoute[route.metadata.guid] || that.getInitialActions();
        if (that.authService.isInitialized()) {
          // Delete route
          that.actionsPerRoute[route.metadata.guid][0].disabled = !that.authService.isAllowed(that.authService.resources.route, that.authService.actions.delete, route);
          // Unmap route
          that.actionsPerRoute[route.metadata.guid][1].disabled = !that.authService.isAllowed(that.authService.resources.route, that.authService.actions.update, route);
        }
      });
    },

    spaceDetail: function () {
      return _.get(this.spaceModel, this.spacePath);
    }

  });
})();
