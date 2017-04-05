(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications')
    .directive('addPipelineWorkflow', addPipelineWorkflow)
    .run(run);

  addPipelineWorkflow.$inject = [];

  /**
   * @memberof cloud-foundry.view.applications
   * @name addAppWorkflow
   * @description An add-app-workflow directive
   * @returns {object} The add-app-workflow directive definition object
   */
  function addPipelineWorkflow() {
    return {
      controller: AddPipelineWorkflowController,
      controllerAs: 'addPipelineWorkflowCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/add-pipeline-workflow/add-pipeline-workflow.html',
      scope: {
        closeDialog: '=',
        dismissDialog: '='
      },
      bindToController: true
    };
  }

  AddPipelineWorkflowController.$inject = [
    'modelManager',
    'appEventService',
    'appUtilsService',
    'appManageVcsTokens',
    '$scope',
    '$q',
    '$timeout',
    '$stateParams'
  ];

  /**
   * @memberof cloud-foundry.view.applications
   * @name AddAppWorkflowController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.utils.appEventService} appEventService - the Event management service
   * @param {app.utils.appUtilsService} appUtilsService - the appUtilsService service
   * @param {app.view.vcs.appManageVcsTokens} appManageVcsTokens - the VCS Token management service
   * @param {object} $scope - Angular $scope
   * @param {object} $q - Angular $q service
   * @param {object} $timeout - the Angular $timeout service
   * @param {object} $stateParams - the UI router $stateParams service
   * @property {app.model.modelManager} modelManager - the Model management service
   * @property {app.utils.appEventService} appEventService - the Event management service
   * @property {appUtilsService} appUtilsService - the appUtilsService service
   * @property {object} $scope - angular $scope
   * @property {object} $q - angular $q service
   * @property {object} $timeout - the Angular $timeout service
   * @property {object} userInput - user's input about new application
   * @property {object} options - workflow options
   */
  function AddPipelineWorkflowController(modelManager, appEventService, appUtilsService, appManageVcsTokens, $scope, $q, $timeout, $stateParams) {
    this.modelManager = modelManager;
    this.appEventService = appEventService;
    this.appUtilsService = appUtilsService;
    this.appManageVcsTokens = appManageVcsTokens;
    this.$scope = $scope;
    this.$q = $q;
    this.$timeout = $timeout;
    this.userInput = {};
    this.options = {};
    this.cnsiGuid = $stateParams.cnsiGuid;
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.vcsModel = modelManager.retrieve('cloud-foundry.model.vcs');

    this.init();
    this.startWorkflow();
  }

  run.$inject = [
    'cloud-foundry.view.applications.workflows.add-pipeline-workflow.prototype'
  ];

  function run(addPipelineWorkflowPrototype) {
    angular.extend(AddPipelineWorkflowController.prototype, addPipelineWorkflowPrototype, {
      reset: function () {
        var that = this;
        var path = 'plugins/cloud-foundry/view/applications/workflows/add-pipeline-workflow/';
        this.data = {};
        this.errors = {};

        var application = this.modelManager.retrieve('cloud-foundry.model.application').application;
        var route = application.summary.routes[0];
        var host, domain;

        if (route) {
          host = route.host;
          domain = { entity: route.domain };
        }

        this.userInput = {
          name: application.summary.name,
          serviceInstance: application.cluster,
          clusterUsername: null,
          clusterPassword: null,
          organization: application.organization,
          space: application.space,
          host: host,
          domain: domain,
          application: application,
          hceCnsi: null,
          source: null,
          repo: null,
          repoFilterTerm: null,
          branch: null,
          buildContainer: null,
          projectId: null,
          imageRegistry: null,
          searchCategory: 'all',
          search: {
            entity: {
              extra: undefined
            }
          }
        };

        this.data.workflow = this.getWorkflowDefinition();
        this.data.workflow.steps.unshift({
          ready: true,
          title: gettext('Select Endpoint'),
          templateUrl: path + 'select-endpoint.html',
          formName: 'application-endpoint-form',
          onNext: function () {
          }
        });

        this.setOptions();

        this.addPipelineActions = {
          stop: function () {
            that.stopWorkflow();
          },

          finish: function () {
            that.modelManager.retrieve('cloud-foundry.model.application').updateDeliveryPipelineMetadata(true);
            that.finishWorkflow();
          }
        };
      }
    });
  }

})();
