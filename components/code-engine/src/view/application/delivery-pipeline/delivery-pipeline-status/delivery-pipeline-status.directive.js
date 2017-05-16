(function () {
  'use strict';

  angular
    .module('code-engine.view.application.delivery-pipeline')
    .directive('ceDeliveryPipelineStatus', ceDeliveryPipelineStatus);

  /**
   * @memberof code-engine.view.applications
   * @name ceDeliveryPipelineStatus
   * @description A directive for showing the delivery pipeline status
   * @returns {object} The ce-delivery-pipeline-status directive definition object
   */
  function ceDeliveryPipelineStatus() {
    return {
      scope: {
        pipeline: '=',
        hce: '=',
        setup: '='
      },
      templateUrl: 'plugins/code-engine/view/application/delivery-pipeline/delivery-pipeline-status/delivery-pipeline-status.html',
      controller: ApplicationSetupPipelineController,
      controllerAs: 'applicationSetupPipelineCtrl',
      bindToController: true
    };
  }

  /**
   * @name ApplicationSetupPipelineController
   * @constructor
   */
  function ApplicationSetupPipelineController() {}

  angular.extend(ApplicationSetupPipelineController.prototype, {
    /**
     * @function setupPipeline
     * @memberOf code-engine.view.applicationSetupPipelineController
     * @description trigger add pipeline workflow
     */
    setupPipeline: function () {
      this.setup();
    }
  });

})();
