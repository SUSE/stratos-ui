(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications')
    .directive('addAppWorkflow', addAppWorkflow);

  addAppWorkflow.$inject = [];

  /**
   * @memberof cloud-foundry.view.applications
   * @name addAppWorkflow
   * @description An add-app-workflow directive
   * @returns {object} The add-app-workflow directive definition object
   */
  function addAppWorkflow() {
    return {
      controller: AddAppWorkflowController,
      controllerAs: 'addAppWorkflowCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/workflows/add-app-workflow/add-app-workflow.html'
    };
  }

  AddAppWorkflowController.$inject = [
    'app.model.modelManager',
    'app.event.eventService',
    '$scope',
    '$q'
  ];

  /**
   * @memberof cloud-foundry.view.applications
   * @name AddAppWorkflowController
   * @constructor
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {app.event.eventService} eventService - the Event management service
   * @param {object} $scope - angular $scope
   * @param {object} $q - angular $q service
   * @property {object} $scope - angular $scope
   * @property {object} $q - angular $q service
   * @property {object} appModel - the Cloud Foundry applications model
   * @property {object} serviceInstanceModel - the application service instance model
   * @property {object} githubModel - the Github model
   * @property {object} privateDomainModel - the private domain model
   * @property {object} sharedDomainModel - the shared domain model
   * @property {object} organizationModel - the organization model
   * @property {object} data - a data bag
   * @property {object} userInput - user's input about new application
   */
  function AddAppWorkflowController(modelManager, eventService, $scope, $q) {
    var that = this;

    this.$scope = $scope;
    this.$q = $q;
    this.addingApplication = false;
    this.eventService = eventService;
    this.appModel = modelManager.retrieve('cloud-foundry.model.application');
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.serviceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.routeModel = modelManager.retrieve('cloud-foundry.model.route');
    this.githubModel = modelManager.retrieve('cloud-foundry.model.github');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.privateDomainModel = modelManager.retrieve('cloud-foundry.model.private-domain');
    this.sharedDomainModel = modelManager.retrieve('cloud-foundry.model.shared-domain');
    this.organizationModel = modelManager.retrieve('cloud-foundry.model.organization');
    this.eventService.$on('cf.events.START_ADD_APP_WORKFLOW', function () {
      that.startWorkflow();
    });

    this.userInput = {};

    $scope.$watch(function () {
      return that.userInput.serviceInstance;
    }, function (newValue) {
      if (newValue) {
        that.getOrganizations();
        that.getDomains().then(function () {
          that.userInput.domain = that.options.domains[0].value;
        });
      }
    });

    $scope.$watch(function () {
      return that.userInput.organization;
    }, function (organization) {
      if (organization) {
        that.getSpacesForOrganization(organization.metadata.guid);
      }
    });

    $scope.$watch(function () {
      return that.options && that.options.subflow;
    }, function (subflow) {
      if (subflow === 'pipeline') {
        that.getHceInstances();
      }
    });
  }

  angular.extend(AddAppWorkflowController.prototype, {

    reset: function () {
      var that = this;

      var path = 'plugins/cloud-foundry/view/applications/workflows/add-app-workflow/';
      this.data = {};

      this.userInput = {
        name: null,
        serviceInstance: null,
        organization: null,
        space: null,
        host: null,
        domain: null,
        hceCnsi: null,
        source: 'github',
        repo: null,
        branch: null,
        buildContainer: null,
        imageRegistry: null,
        projectId: null
      };

      this.data.workflow = {
        allowJump: false,
        allowBack: false,
        title: gettext('Add Application'),
        btnText: {
          cancel: gettext('Save and Close')
        },
        steps: [
          {
            title: gettext('Name'),
            templateUrl: path + 'name.html',
            form: 'application-name-form',
            nextBtnText: gettext('Create and continue'),
            onNext: function () {
              that.createApp();
            }
          },
          {
            title: gettext('Services'),
            templateUrl: path + 'services.html',
            nextBtnText: gettext('Next'),
            onNext: function () {
              that.cnsiModel.list().then(function () {
                var hceCnsis = _.chain(that.cnsiModel.serviceInstances)
                                .filter({ 'cnsi_type': 'hce' })
                                .map(function (o) {
                                  return { label: o.api_endpoint.Host, value: o };
                                })
                                .value();
                [].push.apply(that.options.hceCnsis, hceCnsis);
              });
            }
          },
          {
            title: gettext('Delivery'),
            templateUrl: path + 'delivery.html',
            nextBtnText: gettext('Next'),
            onNext: function () {
              that.appendSubflow(that.data.subflows[that.options.subflow]);
            }
          }
        ]
      };

      this.data.subflows = {
        pipeline: [
          {
            ready: true,
            title: gettext('Select Source'),
            templateUrl: path + 'pipeline-subflow/select-source.html',
            nextBtnText: gettext('Next'),
            onNext: function () {
              // TODO (kdomico): Get or create fake HCE user until HCE API is complete
              that.hceModel.getUserByGithubId(that.userInput.hceCnsi.guid, '123456')
                .then(angular.noop, function (response) {
                  if (response.status === 404) {
                    that.hceModel.createUser(that.userInput.hceCnsi.guid, '123456', 'login', 'token');
                  }
                });

              return that.githubModel.repos()
                .then(function () {
                  var repos = _.filter(that.githubModel.data.repos,
                                       function (o) { return o.permissions.admin; });
                  [].push.apply(that.options.repos, repos);
                });
            }
          },
          {
            ready: true,
            title: gettext('Select Repository'),
            templateUrl: path + 'pipeline-subflow/select-repository.html',
            nextBtnText: gettext('Next'),
            onNext: function () {
              that.getPipelineDetailsData();

              if (that.userInput.repo) {
                that.hceModel.getProjects(that.userInput.hceCnsi.guid).then(function (projects) {
                  var usedBranches = _.chain(projects)
                                      .filter(function (p) {
                                        return p.repo.full_name === that.userInput.repo.full_name;
                                      })
                                      .map(function (p) { return p.repo.branch; })
                                      .value();

                  return that.githubModel.branches(that.userInput.repo.full_name)
                    .then(function () {
                      var branches = _.map(that.githubModel.data.branches,
                                          function (o) {
                                            return {
                                              label: o.name,
                                              value: o.name,
                                              disabled: _.indexOf(usedBranches, o.name) >= 0
                                            };
                                          });
                      [].push.apply(that.options.branches, branches);
                    });
                });
              }
            }
          },
          {
            ready: true,
            title: gettext('Pipeline Details'),
            templateUrl: path + 'pipeline-subflow/pipeline-details.html',
            nextBtnText: gettext('Create pipeline'),
            onNext: function () {
              that.hceModel.getDeploymentTargets(that.userInput.hceCnsi.guid).then(function () {
                var target = _.find(that.hceModel.data.deploymentTargets,
                                    { name: that.userInput.serviceInstance.name });
                if (target) {
                  that.createPipeline(target.deployment_target_id)
                    .then(function (response) {
                      that.userInput.projectId = response.data.id;
                    });
                } else {
                  that.createDeploymentTarget().then(function (newTarget) {
                    that.createPipeline(newTarget.deployment_target_id)
                      .then(function (response) {
                        that.userInput.projectId = response.data.id;
                      });
                  });
                }
              });
            }
          },
          {
            ready: true,
            title: gettext('Notifications'),
            templateUrl: path + 'pipeline-subflow/notifications.html',
            nextBtnText: gettext('Skip')
          },
          {
            ready: true,
            title: gettext('Deploy App'),
            templateUrl: path + 'pipeline-subflow/deploy.html',
            nextBtnText: gettext('Finished code change'),
            isLastStep: true
          }
        ],
        cli: [
          {
            ready: true,
            title: gettext('Deploy'),
            templateUrl: path + 'cli-subflow/deploy.html',
            nextBtnText: gettext('Finished with code change'),
            isLastStep: true
          }
        ]
      };

      this.options = {
        workflow: that.data.workflow,
        userInput: this.userInput,
        subflow: 'pipeline',
        serviceInstances: [],
        organizations: [],
        spaces: [],
        domains: [],
        hceCnsis: [],
        notificationTargets: [
          {
            title: 'HipChat',
            description: gettext('Connect a HipChat instance to receive pipeline events (build, test, deploy) in a  Hipchat room.'),
            img: 'hipchat_logo.png'
          },
          {
            title: 'Http',
            description: gettext('Specify an endpoint where pipeline events should be sent (e.g. URL of an internal website, a communication tool, or an RSS feed).'),
            img: 'httppost_logo.png'
          },
          {
            title: 'Flow Dock',
            description: gettext('Connect a Flowdock instance to receive pipeline events (build, test, deploy) in a specific Flow.'),
            img: 'flowdock_logo.png'
          }
        ],
        sources: [
          {
            img: 'github_octocat.png',
            label: 'Github',
            description: gettext('Connect to a repository hosted on GitHub.com that you own or have admin rights to.'),
            value: 'github'
          },
          {
            img: 'GitHub-Mark-120px-plus.png',
            label: 'Github Enterprise',
            description: gettext('Connect to a repository hosted on an on-premise Github Enterprise instance that you own or have admin rights to.'),
            value: 'github-enterprise'
          },
          {
            img: 'git.png',
            label: 'Git',
            description: gettext('Connect to a repository hosted locally. You will need to provide the name of the repo and the clone URL.'),
            value: 'git'
          }
        ],
        repos: [],
        branches: [],
        buildContainers: [],
        imageRegistries: []
      };

      this.addApplicationActions = {
        stop: function () {
          that.stopWorkflow();
        },

        finish: function () {
          that.finishWorkflow();
        }
      };
    },

    /**
     * @function getOrganizations
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description get organizations
     * @returns {promise} A resolved/rejected promise
     */
    getOrganizations: function () {
      var that = this;
      var cnsiGuid = that.userInput.serviceInstance.guid;
      return this.organizationModel.listAllOrganizations(cnsiGuid)
        .then(function (organizations) {
          that.options.organizations.length = 0;
          [].push.apply(that.options.organizations, _.map(organizations, that.selectOptionMapping));
          that.userInput.organization = that.options.organizations[0].value;
        });
    },

    /**
     * @function getSpacesForOrganization
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description get spaces for organization
     * @param {string} guid - the organization GUID
     * @returns {promise} A resolved/rejected promise
     */
    getSpacesForOrganization: function (guid) {
      var that = this;
      var cnsiGuid = that.userInput.serviceInstance.guid;
      return this.organizationModel.listAllSpacesForOrganization(cnsiGuid, guid)
        .then(function (spaces) {
          that.options.spaces.length = 0;
          [].push.apply(that.options.spaces, _.map(spaces, that.selectOptionMapping));
          that.userInput.space = that.options.spaces[0].value;
        });
    },

    /**
     * @function getDomains
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description get domains, including private domains and shared domains
     * @returns {promise} A resolved/rejected promise
     */
    getDomains: function () {
      this.options.domains.length = 0;
      return this.$q.all([
        this.getPrivateDomains(),
        this.getSharedDomains()
      ]);
    },

    /**
     * @function getPrivateDomains
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description get private domains
     * @returns {promise} A resolved/rejected promise
     */
    getPrivateDomains: function () {
      var that = this;
      var cnsiGuid = that.userInput.serviceInstance.guid;
      return this.privateDomainModel.listAllPrivateDomains(cnsiGuid).then(function (privateDomains) {
        [].push.apply(that.options.domains, _.map(privateDomains, that.selectOptionMapping));
      });
    },

    /**
     * @function getSharedDomains
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description get shared domains
     * @returns {promise} A resolved/rejected promise
     */
    getSharedDomains: function () {
      var that = this;
      var cnsiGuid = that.userInput.serviceInstance.guid;
      return this.sharedDomainModel.listAllSharedDomains(cnsiGuid).then(function (sharedDomains) {
        [].push.apply(that.options.domains, _.map(sharedDomains, that.selectOptionMapping));
      });
    },

    /**
     * @function selectOptionMapping
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description domain mapping function
     * @param {object} o - an object to map
     * @returns {object} select-option object
     */
    selectOptionMapping: function (o) {
      return {
        label: o.entity.name,
        value: o
      };
    },

    getHceInstances: function () {
      var that = this;
      this.cnsiModel.list().then(function () {
        that.options.hceCnsis.length = 0;
        var hceCnsis = _.filter(that.cnsiModel.serviceInstances, { cnsi_type: 'hce' }) || [];
        if (hceCnsis.length > 0) {
          var hceOptions = _.map(hceCnsis, function (o) { return { label: o.api_endpoint.Host, value: o }; });
          [].push.apply(that.options.hceCnsis, hceOptions);
        }
      });
    },

    getPipelineDetailsData: function () {
      var that = this;

      this.hceModel.getBuildContainers(this.userInput.hceCnsi.guid)
        .then(function () {
          var buildContainers = _.map(that.hceModel.data.buildContainers,
                                      function (o) { return { label: o.build_container_label, value: o }; });
          [].push.apply(that.options.buildContainers, buildContainers);
        });

      this.hceModel.getImageRegistries(this.userInput.hceCnsi.guid)
        .then(function () {
          var imageRegistries = _.map(that.hceModel.data.imageRegistries,
                                      function (o) { return { label: o.registry_label, value: o }; });
          [].push.apply(that.options.imageRegistries, imageRegistries);
        });
    },

    /**
     * @function appendSubflow
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description append a sub workflow to the main workflow
     * @param {object} subflow - the sub workflow to append
     */
    appendSubflow: function (subflow) {
      [].push.apply(this.data.workflow.steps, subflow);
    },

    /**
     * @function createApp
     * @memberOf cloud-foundry.view.applications.AddAppWorkflowController
     * @description create an application
     * @returns {promise} A resolved/rejected promise
     */
    createApp: function () {
      var that = this;
      return this.$q(function (resolve, reject) {
        that.appModel.createApp({
          name: that.userInput.name
        }).then(function (app) {
          that.routeModel
            .associateAppWithRoute(that.userInput.domain.metadata.guid, app.metadata.guid)
            .then(resolve, reject);
        });
      });
    },

    createDeploymentTarget: function () {
      return this.hceModel.createDeploymentTarget(this.userInput.hceCnsi.guid,
                                                  this.userInput.serviceInstance.name,
                                                  this.userInput.serviceInstance.url,
                                                  this.userInput.serviceInstance.account,
                                                  this.userInput.serviceInstance.account_password,
                                                  this.userInput.organization.entity.name || 'cnapui',
                                                  this.userInput.space.entity.name || 'cnapuispace');
    },

    createPipeline: function (targetId) {
      var projectType = this.userInput.buildContainer.build_container_label.split(' ')[0];
      return this.hceModel.createProject(this.userInput.hceCnsi.guid,
                                         this.userInput.name,
                                         this.userInput.source,
                                         this.githubModel.getToken(),
                                         targetId,
                                         projectType.toLowerCase(),
                                         this.userInput.buildContainer.build_container_id,
                                         this.userInput.repo,
                                         this.userInput.branch);
    },

    triggerPipeline: function () {
      return this.hceModel.triggerPipelineExecution(this.userInput.hceCnsi.guid, this.userInput.projectId, 'HEAD');
    },

    startWorkflow: function () {
      var that = this;
      this.addingApplication = true;
      this.reset();
      this.serviceInstanceModel.list()
        .then(function (serviceInstances) {
          var validServiceInstances = _.chain(_.values(serviceInstances))
                                       .filter('valid')
                                       .map(function (o) {
                                         return { label: o.api_endpoint.Host, value: o };
                                       })
                                       .value();
          [].push.apply(that.options.serviceInstances, validServiceInstances);
        });
    },

    stopWorkflow: function () {
      this.addingApplication = false;
    },

    finishWorkflow: function () {
      this.triggerPipeline();
      this.addingApplication = false;
    }
  });

})();
