(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications')
    .directive('deleteAppWorkflow', deleteAppWorkflow);

  deleteAppWorkflow.$inject = [];

  /**
   * @memberof cloud-foundry.view.applications
   * @name deleteAppWorkflow
   * @description An delete-app-workflow directive
   * @returns {object} The delete-app-workflow directive definition object
   */
  function deleteAppWorkflow() {
    return {
      controller: DeleteAppWorkflowController,
      controllerAs: 'deleteAppWorkflowCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/delete-app-workflow.html',
      scope: {
        closeDialog: '=',
        dismissDialog: '=',
        guids: '='
      },
      bindToController: true
    };
  }

  DeleteAppWorkflowController.$inject = [
    '$filter',
    'modelManager',
    'appEventService',
    '$q',
    '$interpolate',
    'appUtilsService',
    'appEndpointsCnsiService'
  ];

  /**
   * @memberof cloud-foundry.view.applications
   * @name DeleteAppWorkflowController
   * @constructor
   * @param {object} $filter - angular $filter service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.utils.appEventService} appEventService - the Event management service
   * @param {object} $q - angular $q service
   * @param {object} $interpolate - the Angular $interpolate service
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {appEndpointsCnsiService} appEndpointsCnsiService - service to support dashboard with cnsi type endpoints
   * @property {app.utils.appEventService} appEventService - the Event management service
   * @property {object} $q - angular $q service
   * @property {object} $interpolate - the Angular $interpolate service
   * @property {appUtilsService} appUtilsService - the appUtilsService service
   * @property {object} appModel - the Cloud Foundry applications model
   * @property {object} routeModel - the Cloud Foundry route model
   * @property {boolean} deletingApplication - a flag indicating if the workflow in progress
   * @property {object} data - a data bag
   * @property {object} userInput - user's input about new application
   */
  function DeleteAppWorkflowController($filter, modelManager, appEventService, $q, $interpolate, appUtilsService,
                                       appEndpointsCnsiService) {
    this.appEventService = appEventService;
    this.$q = $q;
    this.$interpolate = $interpolate;
    this.appUtilsService = appUtilsService;
    this.appModel = modelManager.retrieve('cloud-foundry.model.application');
    this.routeModel = modelManager.retrieve('cloud-foundry.model.route');
    this.serviceInstanceModel = modelManager.retrieve('cloud-foundry.model.service-instance');
    this.deletingApplication = false;
    this.cnsiGuid = null;
    this.$filter = $filter;
    this.appEndpointsCnsiService = appEndpointsCnsiService;

    this.startWorkflow(this.guids || {});
  }

  angular.extend(DeleteAppWorkflowController.prototype, {
    reset: function () {
      var that = this;
      var path = 'plugins/cloud-foundry/view/applications/workflows/delete-app-workflow/';
      this.cnsiGuid = null;
      this.data = {};
      this.userInput = {
        checkedRouteValue: _.keyBy(this.appModel.application.summary.routes, 'guid'),
        // This will include any hce user server.. even through we may not show it we still want it removed
        checkedServiceValue: _.keyBy(this.appModel.application.summary.services, 'guid')
      };

      this.data.workflow = {
        initControllers: function (wizard) {
          that.wizard = wizard;
          wizard.postInitTask.promise.then(function () {
            that.options.isBusy = true;
            that.wizard.nextBtnDisabled = true;
            that.checkAppServices();
            that.checkAppRoutes().finally(function () {
              that.wizard.nextBtnDisabled = false;
              that.options.isBusy = false;
            });
          });
        },
        lastStepCommit: true,
        allowCancelAtLastStep: true,
        hideStepNavStack: true,
        steps: [
          {
            templateUrl: path + 'delete-services-and-routes.html',
            nextBtnText: gettext('Delete app and associated items'),
            isLastStep: true
          }
        ]
      };

      this.options = {
        workflow: that.data.workflow,
        userInput: this.userInput,
        appModel: this.appModel,
        isBusy: true,
        isDeleting: false,
        hasError: false,
        safeRoutes: [],
        safeServices: []
      };

      this.deleteApplicationActions = {
        stop: function () {
          that.stopWorkflow();
        },

        finish: function (wizard) {
          wizard.disableButtons();
          that.finishWorkflow().catch(function () {
            wizard.resetButtons();
          });
        }
      };
    },

    checkAppRoutes: function () {
      var that = this;
      this.options.safeRoutes = [];
      var tasks = [];
      var routes = this.appModel.application.summary.routes;
      routes.forEach(function (route) {
        tasks.push(that.routeModel.listAllAppsForRoute(that.cnsiGuid, route.guid, { 'results-per-page': 1}, true));
      });
      return this.$q.all(tasks).then(function (results) {
        results.forEach(function (routeInfo, index) {
          // Check that each route is only bound to 1 app (which implicitly must be this app)
          if (routeInfo.total_results === 1) {
            that.options.safeRoutes.push(routes[index]);
          }
        });
      });
    },

    checkAppServices: function () {
      this.options.safeServices = _.filter(
        this.appModel.application.summary.services,
        function (o) {
          return o.bound_app_count === 1;
        }
      );
      this.options.safeServices =
       this.$filter('removeHceServiceInstance')(this.options.safeServices, this.appModel.application.summary.guid);
    },

    /**
     * @function deleteApp
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an application
     * @returns {promise} A resolved/rejected promise
     */
    deleteApp: function () {
      var that = this;
      var removeAndDeleteRoutes = this.removeAppFromRoutes().then(function () {
        return that.tryDeleteEachRoute();
      });

      // May not be able to delete the project (HCE user is project developer and not project admin) so ensure
      // we attempt this up front
      return this.deleteProject()
        .then(function () {
          return that.$q.all([
            removeAndDeleteRoutes,
            that.deleteServiceBindings()
          ]);
        })
        .then(function () {
          return that.appModel.deleteApp(that.cnsiGuid, that.appModel.application.summary.guid);
        });
    },

    /**
     * @function removeAppFromRoutes
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description remove app from all the routes
     * @returns {promise} A resolved/rejected promise
     */
    removeAppFromRoutes: function () {
      var that = this;
      var checkedRouteValue = this.userInput.checkedRouteValue;
      var appGuid = this.appModel.application.summary.guid;
      var funcStack = [];

      Object.keys(checkedRouteValue).forEach(function (guid) {
        funcStack.push(function () {
          return that.routeModel.removeAppFromRoute(that.cnsiGuid, guid, appGuid);
        });
      });

      return this.appUtilsService.runInSequence(funcStack);
    },

    /**
     * @function deleteServiceBindings
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete all service binding for the app
     * @returns {promise} A resolved/rejected promise
     */
    deleteServiceBindings: function () {
      var that = this;
      var checkedServiceValue = this.userInput.checkedServiceValue;

      /**
       * service instances that aren't bound to only this app
       * should not be deleted, only unbound
       */
      var serviceInstanceGuids = _.keys(checkedServiceValue);
      if (serviceInstanceGuids.length > 0) {
        return this._unbindServiceInstances(serviceInstanceGuids)
          .then(function () {
            var safeServiceInstances = _.chain(checkedServiceValue)
              .filter(function (o) { return o && o.bound_app_count === 1; })
              .map('guid')
              .value();
            return that._deleteServiceInstances(safeServiceInstances);
          });
      } else {
        var deferred = this.$q.defer();
        deferred.resolve();
        return deferred.promise;
      }
    },

    /**
     * @function _unbindServiceInstances
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Unbind service instance from app
     * @param {array} bindingGuids - the service binding GUIDs
     * @returns {promise} A resolved/rejected promise
     */
    _unbindServiceInstances: function (bindingGuids) {
      var that = this;
      var appGuid = this.appModel.application.summary.guid;
      var q = 'service_instance_guid IN ' + bindingGuids.join(',');
      return this.appModel.listServiceBindings(this.cnsiGuid, appGuid, {q: q})
        .then(function (bindings) {
          var funcStack = [];

          angular.forEach(bindings, function (binding) {
            funcStack.push(function () {
              return that.appModel.unbindServiceFromApp(that.cnsiGuid, appGuid, binding.metadata.guid);
            });
          });

          return that.appUtilsService.runInSequence(funcStack);
        });
    },

    /**
     * @function _deleteServiceInstances
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Delete service instances
     * @param {array} safeServiceInstances - the service instance GUIDs
     * @returns {promise} A resolved/rejected promise
     */
    _deleteServiceInstances: function (safeServiceInstances) {
      var that = this;
      var funcStack = [];

      angular.forEach(safeServiceInstances, function (serviceInstanceGuid) {
        funcStack.push(function () {
          return that._deleteServiceInstanceIfPossible(serviceInstanceGuid);
        });
      });

      return this.appUtilsService.runInSequence(funcStack);
    },

    /**
     * @function _deleteServiceInstanceIfPossible
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Delete service instance if possible. Ignore AssociationNotEmpty
     * errors.
     * @param {string} serviceInstanceGuid - the service instance GUID
     * @returns {promise} A resolved/rejected promise
     */
    _deleteServiceInstanceIfPossible: function (serviceInstanceGuid) {
      var that = this;
      return this.$q(function (resolve, reject) {
        that.serviceInstanceModel.deleteServiceInstance(that.cnsiGuid, serviceInstanceGuid)
          .then(resolve, function (response) {
            if (response.data.error_code === 'CF-AssociationNotEmpty') {
              resolve();
            } else {
              reject();
            }
          });
      });
    },

    /**
     * @function deleteRouteIfPossible
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description delete an route if possible
     * @param {string} routeId - the identifier of the route
     * @returns {promise} A resolved/rejected promise
     */
    deleteRouteIfPossible: function (routeId) {
      var that = this;
      return this.$q(function (resolve, reject) {
        that.routeModel.listAllAppsForRouteWithoutStore(that.cnsiGuid, routeId, { 'results-per-page': 1}, true)
          .then(function (apps) {
            if (apps.total_results === 0) {
              that.routeModel.deleteRoute(that.cnsiGuid, routeId).then(resolve, reject);
            } else {
              reject();
            }
          });
      });
    },

    /**
     * @function tryDeleteEachRoute
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description try delete each route associated with the application
     * @returns {promise} A resolved/rejected promise
     */
    tryDeleteEachRoute: function () {
      var that = this;
      var checkedRouteValue = _.pickBy(this.userInput.checkedRouteValue, function (value) { return value; });
      var funcStack = [];

      Object.keys(checkedRouteValue).forEach(function (routeId) {
        funcStack.push(function () {
          return that.deleteRouteIfPossible(routeId);
        });
      });

      return this.appUtilsService.runInSequence(funcStack);
    },

    /**
     * @function deleteProject
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description Delete HCE project
     * @returns {promise} A promise
     */
    deleteProject: function () {
      return this.appEndpointsCnsiService.callAllEndpointProvidersFunc('deleteApplicationPipeline', _.get(this, 'details.project'));
    },

    /**
     * @function startWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @param {object} data - cnsiGuid and project information
     * @description start workflow
     */
    startWorkflow: function (data) {
      this.deletingApplication = true;
      this.reset();
      this.cnsiGuid = data.cnsiGuid;
    },

    /**
     * @function stopWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description stop workflow
     */
    stopWorkflow: function () {
      this.deletingApplication = false;
      this.closeDialog();
    },

    /**
     * @function finishWorkflow
     * @memberOf cloud-foundry.view.applications.DeleteAppWorkflowController
     * @description finish workflow
     * @returns {promise} A promise
     */
    finishWorkflow: function () {
      var that = this;
      var appName = this.appModel.application.summary.name;
      this.options.isDeleting = true;
      this.options.hasError = false;
      return this.deleteApp().then(function () {
        that.deletingApplication = false;
        // show notification for successful binding
        var successMsg = gettext("'{{appName}}' has been deleted");
        var message = that.$interpolate(successMsg)({appName: appName});
        that.appEventService.$emit('events.NOTIFY_SUCCESS', {message: message});
        that.appEventService.$emit(that.appEventService.events.REDIRECT, 'cf.applications.list.gallery-view');
        that.dismissDialog();
      })
      .catch(function () {
        that.options.hasError = true;
        return that.$q.reject();
      })
      .finally(function () {
        that.options.isDeleting = false;
      });
    }
  });

})();
