(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-pipeline', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.delivery-pipeline', {
      url: '/delivery-pipeline',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-pipeline/delivery-pipeline.html',
      controller: ApplicationDeliveryPipelineController,
      controllerAs: 'applicationDeliveryPipelineCtrl'
    });
  }

  ApplicationDeliveryPipelineController.$inject = [
    'app.model.modelManager',
    '$stateParams'
  ];

  /**
   * @name ApplicationDeliveryPipelineController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {object} $stateParams - the UI router $stateParams service
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {string} id - the application GUID
   */
  function ApplicationDeliveryPipelineController(modelManager, $stateParams) {
    var that = this;
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.id = $stateParams.guid;

    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.hceCnsi = null;

    this.project = null;
    this.notificationTargets = [];
    this.postDeployActions = [];

    this.notificationTargetActions = [
      {
        name: gettext('Delete'),
        execute: function (target) {
          this.hceModel.removeNotificationTarget('123', target.id)
            .then(function () {
              _.remove(that.notificationTargets, { id: target.id });
            });
        }
      }
    ];

    /* eslint-disable */
    this.postDeployActionActions = [
      { name: gettext('Delete'), execute: function (target) { alert('Delete ' + target); } }
    ];
    this.containerRegistryActions = [
      {
        name: gettext('Designate to Pipeline'),
        execute: function (target) { alert('Designate ' + target.registry_label); }
      },
      {
        name: gettext('Delete Registry'),
        execute: function (target) { alert('Delete ' + target.registry_label); }
      }
    ];
    /* eslint-enable */

    // TODO (kdomico): Get or create fake HCE user until HCE API is complete
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.cnsiModel.list().then(function () {
      var hceCnsis = _.filter(that.cnsiModel.serviceInstances, { cnsi_type: 'hce' }) || [];
      if (hceCnsis.length > 0) {
        that.hceCnsi = hceCnsis[0];
        that.hceModel.getUserByGithubId(that.hceCnsi.guid, '123456')
          .then(function () {
            that.hceModel.getProjects(that.hceCnsi.guid)
              .then(function () {
                that.getProject();
              });
            that.hceModel.getImageRegistries(that.hceCnsi.guid);
          }, function (response) {
            if (response.status === 404) {
              that.hceModel.createUser(that.hceCnsi.guid, '123456', 'login', 'token');
              that.hceModel.getImageRegistries(that.hceCnsi.guid);
            }
          });
      }
    });
  }

  angular.extend(ApplicationDeliveryPipelineController.prototype, {
    getProject: function () {
      if (this.hceCnsi) {
        var that = this;
        this.project = this.hceModel.getProject(this.model.application.summary.name);
        if (angular.isDefined(this.project)) {
          this.hceModel.getDeploymentTarget(this.hceCnsi.guid, this.project.deployment_target_id)
            .then(function (response) {
              that.project.deploymentTarget = response.data[that.hceCnsi.guid];
            });

          this.hceModel.getBuildContainer(this.hceCnsi.guid, this.project.build_container_id)
            .then(function (response) {
              that.project.buildContainer = response.data[that.hceCnsi.guid];
            });

          this.hceModel.getNotificationTargets(this.hceCnsi.guid, this.project.id)
            .then(function (response) {
              that.notificationTargets.length = 0;
              [].push.apply(that.notificationTargets, response.data[that.hceCnsi.guid]);
            });
        }
      }
    }
  });

})();
