(function () {
  'use strict';

  angular
    .module('service-manager.view.service.detail.services', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('sm.endpoint.detail.services', {
      url: '/services',
      templateUrl: 'plugins/service-manager/view/service/detail/services/service-manager.services.html',
      controller: ServiceManagerServicesController,
      controllerAs: 'servicesCtrl',
      ncyBreadcrumb: {
        label: '{{ smCtrl.endpoint.name || "..." }}',
        parent: 'sm.endpoint.detail'
      }
    });
  }

  ServiceManagerServicesController.$inject = [
    '$state'
  ];

  function ServiceManagerServicesController($state) {
    this.$state = $state;
  }

  angular.extend(ServiceManagerServicesController.prototype, {
    open: function (endpoint) {
      console.log('OPEN');
      console.log(endpoint);
      this.$state.go('sm.endpoint.service', {id: endpoint.id});
    }
  });

})();
