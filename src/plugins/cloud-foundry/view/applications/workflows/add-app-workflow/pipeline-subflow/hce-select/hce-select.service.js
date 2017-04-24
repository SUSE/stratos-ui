(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.workflows')
    .factory('cloud-foundry.view.applications.application.delivery-pipeline.hceSelect', hceSelectFactory)
    .controller('HceSelectController', HceSelectController);

  hceSelectFactory.$inject = [
    'frameworkDetailView'
  ];

  /**
   * @function hceSelectFactory
   * @memberof cloud-foundry.view.applications.application.delivery-pipeline
   * @description HCE Selection modal dialog factory
   * @param {helion.framework.widgets.frameworkDetailView} frameworkDetailView - the detail view service
   * @constructor
   */
  function hceSelectFactory(frameworkDetailView) {
    return {

      /**
       * @function show
       * @memberof cloud-foundry.view.applications.application.delivery-pipeline
       * @description Show HCE Selection modal dialog
       * @param {Array} hceCnsis - List of HCE CNSIs
       * @param {Object} selectedHceCnsi - Default selected HCE CNSI
       * @constructor
       */
      show: function (hceCnsis, selectedHceCnsi) {

        return frameworkDetailView(
          {
            controller: HceSelectController,
            controllerAs: 'HceSelectCtrl',
            detailViewTemplateUrl: 'plugins/cloud-foundry/view/applications/workflows/' +
            'add-app-workflow/pipeline-subflow/hce-select/hce-select.html'
          },
          {
            hceCnsis: hceCnsis,
            selectedHceCnsi: selectedHceCnsi
          }
        );
      }
    };
  }

  HceSelectController.$inject = [
    '$uibModalInstance',
    'context'
  ];

  /**
   * @function HceSelectController
   * @memberof cloud-foundry.view.applications.application.delivery-pipeline
   * @description Controller for the HCE Selection dialog
   * @param {Object} $uibModalInstance - the Angular UI Bootstrap $uibModalInstance service
   * @param {Object} context - the uibModal context
   * @constructor
   */
  function HceSelectController($uibModalInstance, context) {

    var that = this;
    that.$uibModalInstance = $uibModalInstance;
    that.context = context;

    this.hceCnsi = this.context.selectedHceCnsi;

  }

  angular.extend(HceSelectController.prototype, {

    /**
     * @function getEndpoint
     * @memberof cloud-foundry.view.applications.application.delivery-pipeline
     * @description get URL of selected HCE instance
     * @param {object} hceCnsi HCE CNSI information
     * @returns {string}
     */
    getEndpoint: function (hceCnsi) {
      return hceCnsi.api_endpoint.Scheme + '://' + hceCnsi.api_endpoint.Host;
    },

    /**
     * @function getName
     * @memberof cloud-foundry.view.applications.application.delivery-pipeline
     * @description get name of selected HCE instance
     * @param {object} hceCnsi HCE CNSI information
     * @returns {string}
     */
    getName: function (hceCnsi) {
      return hceCnsi.name;
    },

    /**
     * @function selectHce
     * @memberof cloud-foundry.view.applications.application.delivery-pipeline
     * @description Closes the dialog and resolve the `result`
     * promise with the selected HCE CNSI
     */
    selectHce: function () {
      this.$uibModalInstance.close(this.hceCnsi);
    },

    /**
     * @function cancel
     * @memberof cloud-foundry.view.applications.application.delivery-pipeline
     * @description dimiss dialog
     */
    cancel: function () {
      this.$uibModalInstance.dismiss();
    }
  });

})();
