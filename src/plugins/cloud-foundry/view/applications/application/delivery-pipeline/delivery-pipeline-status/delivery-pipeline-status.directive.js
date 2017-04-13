(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-pipeline')
    .directive('deliveryPipelineStatus', deliveryPipelineStatus);

  /**
   * @memberof cloud-foundry.view.applications
   * @name deliveryPipelineStatus
   * @description A directive for showing the delivery pipeline status
   * @returns {object} The delivery-pipeline-status directive definition object
   */
  function deliveryPipelineStatus() {
    return {
      scope: {
        pipeline: '=',
        hce: '=',
        setup: '='
      },
      templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-pipeline/delivery-pipeline-status/delivery-pipeline-status.html',
      controller: ApplicationSetupPipelineController,
      controllerAs: 'applicationSetupPipelineCtrl',
      bindToController: true
    };
  }

  /**
   * @name ApplicationSetupPipelineController
   * @param {object} $rootScope  - the Angular $rootScope
   * @param {object} $scope  - the Angular $scope
   * @constructor
   */
  function ApplicationSetupPipelineController($rootScope, $scope) {
    $scope.OEM_CONFIG = $rootScope.OEM_CONFIG;
  }

  angular.extend(ApplicationSetupPipelineController.prototype, {
    /**
     * @function setupPipeline
     * @memberOf cloud-foundry.view.applications.ApplicationSetupPipelineController
     * @description trigger add pipeline workflow
     */
    setupPipeline: function () {
      this.setup();
    }
  });

})();
