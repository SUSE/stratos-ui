(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.services')
    .directive('serviceCard', serviceCard);

  /**
   * @memberof cloud-foundry.view.applications.application.services
   * @name serviceCard
   * @description The service card directive
   * @returns {object} The service card directive definition object
   */
  function serviceCard() {
    return {
      bindToController: {
        app: '=',
        cnsiGuid: '=',
        service: '=',
        addOnly: '=?'
      },
      controller: ServiceCardController,
      controllerAs: 'serviceCardCtrl',
      restrict: 'E',
      scope: {},
      templateUrl: 'plugins/cloud-foundry/view/applications/application/services/service-card/service-card.html'
    };
  }

  /**
   * @memberof cloud-foundry.view.applications.application.services.serviceCard
   * @name ServiceCardController
   * @description Controller for service card directive
   * @constructor
   * @param {object} $scope - the Angular $scope service
   * @param {object} $q - the Angular $q service
   * @param {object} cfServiceInstanceService - the service instance service
   * @property {array} actions - the actions that can be performed from vm.service card
   */
  function ServiceCardController(
    $scope,
    $q,
    cfServiceInstanceService
  ) {
    var vm = this;

    vm.detach = detach;
    vm.viewEnvVariables = viewEnvVariables;

    vm.actions = [
      {
        name: 'app.app-info.app-tabs.services.card.actions.detach',
        execute: function () {
          detach(vm.service).then(function (result) {
            vm.service = result;
          });
        }
      }
    ];

    $scope.$watch(function () {
      return vm.service;
    }, function () {
      vm.cardData = {
        title: vm.service.entity.name
      };
    });

    /**
     * @function detach
     * @memberof cloud-foundry.view.applications.application.services.serviceCard.ServiceCardController
     * @param {object} serviceInstance The service instance to be detached from the application
     * @description Detach service instance from app
     * @returns {undefined}
     */
    function detach(serviceInstance) {
      var serviceBinding = serviceInstance.entity.service_bindings
        ? _.find(serviceInstance.entity.service_bindings, function (binding) {
          return vm.app.summary.guid === binding.entity.app_guid;
        }) : null;
      if (serviceBinding) {
        var deferred = $q.defer();
        cfServiceInstanceService.unbindServiceFromApp(
          vm.cnsiGuid,
          vm.app.summary.guid,
          serviceBinding.metadata.guid,
          serviceInstance.entity.name,
          function () {
            serviceInstance.entity.service_bindings = [];
            return deferred.resolve(serviceInstance);
          }
        );
        return deferred.promise;
      }
      return $q.resolve(serviceInstance);
    }

    /**
     * @function viewEnvVariables
     * @memberof cloud-foundry.view.applications.ManageServicesController
     * @description View environmental variables of service instance
     * @param {object} instance - the service instance to view
     * @returns {promise} A promise object
     */
    function viewEnvVariables(instance) {
      return cfServiceInstanceService.viewEnvVariables(
        vm.cnsiGuid,
        vm.app.summary,
        instance.entity.service_plan.entity.service.entity.label,
        instance.entity
      );
    }

  }

})();
