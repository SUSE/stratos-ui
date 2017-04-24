(function () {
  'use strict';

  //cloud-foundry.view.applications.application.delivery-pipeline
  angular
    .module('cloud-foundry.view.applications.workflows')
    .directive('codeEngineInfo', codeEngineInfo);

  codeEngineInfo.$inject = [];

  function codeEngineInfo() {
    return {
      bindToController: {
        hce: '=',
        hceCnsis: '='
      },
      controller: CodeEngineInfoController,
      controllerAs: 'codeEngineInfoCtrl',
      scope: {},
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/add-app-workflow/pipeline-subflow/code-engine-info/code-engine-info.html'
    };
  }

  //TODO: RC FIXME
  //'cloud-foundry.view.applications.application.delivery-pipeline.hceSelect'
  CodeEngineInfoController.$inject = [

  ];

  /**
   * @memberof cloud-foundry.view.applications.application.delivery-pipeline
   * @name CodeEngineInfoController
   * @description Shows details about the currently
   * selected HCE instance in the add-app-workflow
   * @constructor
   * @param {cloud-foundry.view.applications.application.delivery-pipeline.hceSelect} hceSelect  HCE Selection detail view service
   * @constructor
   */
  function CodeEngineInfoController(hceSelect) {

    this.hceSelect = hceSelect || [];
    // Select the first hce instance
    if (this.hceCnsis.length > 0) {
      this.hce = this.hceCnsis[0];
    }
  }

  angular.extend(CodeEngineInfoController.prototype, {

    /**
     * @function getName
     * @memberOf cloud-foundry.view.applications.application.delivery-pipeline
     * @description get name of selected HCE instance
     * @returns {string}
     */
    getName: function () {
      return this.hce.name;
    },

    /**
     * @function getEndpoint
     * @memberOf cloud-foundry.view.applications.application.delivery-pipeline
     * @description get URL of selected HCE instance
     * @returns {string}
     */
    getEndpoint: function () {
      return this.hce.api_endpoint.Scheme + '://' + this.hce.api_endpoint.Host;
    },

    /**
     * @function showHceEndpointForm
     * @memberOf cloud-foundry.view.applications.application.delivery-pipeline
     * @description Show HCE Selection modal
     */
    showHceEndpointForm: function () {
      var that = this;
      this.hceSelect.show(this.hceCnsis, this.hce).result.then(function (selectedHce) {
        that.hce = selectedHce;
      });
    },

    /**
     * @function hasMultipleHces
     * @memberOf cloud-foundry.view.applications.application.delivery-pipeline
     * @description Helper for determining if there more HCE instances
     * @returns {boolean}
     */
    hasMultipleHces: function () {
      return this.hceCnsis.length > 1;
    }

  });

})();
