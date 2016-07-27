(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model.hce
   * @memberOf cloud-foundry.model
   * @name hce
   * @description Helion Code Engine model
   */
  angular
    .module('cloud-foundry.model')
    .run(registerHceModel);

  registerHceModel.$inject = [
    'app.model.modelManager',
    'app.api.apiManager',
    'app.event.eventService'
  ];

  function registerHceModel(modelManager, apiManager, eventService) {
    modelManager.register('cloud-foundry.model.hce', new HceModel(apiManager, eventService));
  }

  /**
   * @memberof cloud-foundry.model.hce
   * @name HceModel
   * @param {app.api.apiManager} apiManager - the application API manager
   * @param {app.event.eventService} eventService - the application event service
   * @property {app.api.apiManager} apiManager - the application API manager
   * @property {app.event.eventService} eventService - the application event service
   * @property {object} data - the Helion Code Engine data
   * @class
   */
  function HceModel(apiManager, eventService) {
    var that = this;
    this.apiManager = apiManager;
    this.eventService = eventService;
    this.data = {
      buildContainers: [],
      deploymentTargets: [],
      imageRegistries: [],
      projects: {},
      pipelineExecutions: [],
      vcsInstances: [],
      vcsTypes: []
    };

    this.eventService.$on(this.eventService.events.LOGOUT, function () {
      that.onLogout();
    });

    // Proxy config to skip auth - used for HCE
    // and to pass through response directly (when we are only talking to a single CNSI)
    this.hceProxyPassthroughConfig = {
      headers: {
        'x-cnap-passthrough': 'true'
      }
    };
  }

  angular.extend(HceModel.prototype, {

    /**
     * @function infos
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get service info for one or more HCE instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    infos: function (guid) {
      return this.apiManager.retrieve('cloud-foundry.api.HceInfoApi')
        .info(guid, {});
    },

    /**
     * @function info
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get service info for an HCE instance
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    info: function (guid) {
      return this.apiManager.retrieve('cloud-foundry.api.HceInfoApi')
        .info(guid, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getBuildContainer
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get build container by ID
     * @param {string} guid - the HCE instance GUID
     * @param {number} id - the build container ID
     * @returns {promise} A promise object
     * @public
     */
    getBuildContainer: function (guid, id) {
      return this.apiManager.retrieve('cloud-foundry.api.HceContainerApi')
        .getBuildContainer(guid, id, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getBuildContainers
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get registered build container instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getBuildContainers: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceContainerApi')
        .getBuildContainers(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetBuildContainers(response);
        });
    },

    /**
     * @function getDeploymentTarget
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get deployment target by ID
     * @param {string} guid - the HCE instance GUID
     * @param {number} id - the deployment target ID
     * @returns {promise} A promise object
     * @public
     */
    getDeploymentTarget: function (guid, id) {
      return this.apiManager.retrieve('cloud-foundry.api.HceDeploymentApi')
        .getDeploymentTarget(guid, id, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getDeploymentTargets
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get registered deployment targets
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getDeploymentTargets: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceDeploymentApi')
        .getDeploymentTargets(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetDeploymentTargets(response);
        });
    },

    /**
     * @function getImageRegistries
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get registered image registries
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getImageRegistries: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceContainerApi')
        .getImageRegistries(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetImageRegistries(response);
        });
    },

    /**
     * @function getNotificationTargets
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get notification targets for project
     * @param {string} guid - the HCE instance GUID
     * @param {number} projectId - the project ID
     * @returns {promise} A promise object
     * @public
     */
    getNotificationTargets: function (guid, projectId) {
      return this.apiManager.retrieve('cloud-foundry.api.HceNotificationApi')
        .getNotificationTargets(guid, { project_id: projectId }, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getProject
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get project by name
     * @param {string} name - the project name
     * @returns {promise} A promise object
     * @public
     */
    getProject: function (name) {
      return this.data.projects[name];
    },

    /**
     * @function getProjects
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get projects of user
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getProjects: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceProjectApi')
        .getProjects(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetProjects(response);
        });
    },

    /**
     * @function getPipelineExecutions
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get executions by project ID
     * @param {string} guid - the HCE instance GUID
     * @param {string} projectId - the HCE project ID
     * @returns {promise} A promise object
     * @public
     */
    getPipelineExecutions: function (guid, projectId) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HcePipelineApi')
        .getPipelineExecutions(guid, { project_id: projectId }, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetPipelineExecutions(response);
        });
    },

    /**
     * @function getPipelineEvents
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get events by execution ID
     * @param {string} guid - the HCE instance GUID
     * @param {string} executionId - the HCE execution ID that owns the events
     * @returns {promise} A promise object
     * @public
     */
    getPipelineEvents: function (guid, executionId) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HcePipelineApi')
        .getPipelineEvents(guid, { execution_id: executionId }, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetPipelineEvents(response);
        });
    },

    /**
     * @function getVcses
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get VCS instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getVcses: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceVcsApi')
        .getVcses(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetVcses(response);
        });
    },

    /**
     * @function listVcsTypes
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Get VCS types
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    listVcsTypes: function (guid) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceVcsApi')
        .listVcsTypes(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onListVcsTypes(response);
        });
    },

    /**
     * @function createDeploymentTarget
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Create a new deployment target
     * @param {string} guid - the HCE instance GUID
     * @param {string} name - the user-provided label for this target
     * @param {string} url - the URL endpoint that the target is accessible at
     * @param {string} username - the username to authenticate the target with
     * @param {string} password - the password to authenticate the target with
     * @param {string} org - the organization under which a project will be deployed to this target
     * @param {string} space - the space within an organization that a project will be deployed under on this target
     * @param {string} targetType - the type of deployment target (e.g. cloudfoundry, aws)
     * @returns {promise} A promise object
     * @public
     */
    createDeploymentTarget: function (guid, name, url, username, password, org, space, targetType) {
      var that = this;
      var newTarget = {
        name: name,
        url: url,
        userName: username,
        password: password,
        organization: org,
        space: space,
        type: targetType || 'cloudfoundry'
      };

      return this.apiManager.retrieve('cloud-foundry.api.HceDeploymentApi')
        .addDeploymentTarget(guid, newTarget, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onCreateDeploymentTarget(response);
        });
    },

    /**
     * @function createProject
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Create a new project
     * @param {string} guid - the HCE instance GUID
     * @param {string} name - the project name
     * @param {string} vcs - the VCS type
     * @param {string} vcsToken - the VCS token
     * @param {number} targetId - the deployment target ID
     * @param {number} buildContainerId - the build container ID
     * @param {object} repo - the repo to use
     * @param {string} branch - the branch to use
     * @returns {promise} A promise object
     * @public
     */
    createProject: function (guid, name, vcs, vcsToken, targetId, buildContainerId, repo, branch) {
      var newProject = {
        name: name,
        vcs_id: vcs.vcs_id,
        build_container_id: buildContainerId,
        deployment_target_id: targetId,
        token: vcsToken,
        branchRefName: branch,
        repo: {
          vcs: vcs.vcs_type,
          full_name: repo.full_name,
          owner: repo.owner.login,
          name: repo.name,
          github_repo_id: repo.id,
          branch: branch,
          clone_url: repo.clone_url,
          http_url: repo.html_url,
          ssh_url: repo.ssh_url,
          webhook_url: repo.hooks_url
        }
      };

      return this.apiManager.retrieve('cloud-foundry.api.HceProjectApi')
        .createProject(guid, newProject, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function downloadArtifact
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Download the artifact associated with the artifact ID.
     * @param {string} guid - the HCE instance GUID
     * @param {string} artifactId - the HCE artifact ID
     * @returns {promise} A promise object.
     * @public
     */
    downloadArtifact: function (guid, artifactId) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceArtifactApi')
        .downloadArtifact(guid, artifactId, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onDownloadArtifact(response);
        });
    },

    removeProject: function (guid, projectId) {
      var that = this;
      return this.apiManager.retrieve('cloud-foundry.api.HceProjectApi')
        .deleteProject(guid, projectId, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.getProjects(guid);
          return response;
        });
    },

    /**
     * @function removeNotificationTarget
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Remove notification target
     * @param {string} guid - the HCE instance GUID
     * @param {number} targetId - the notification target ID
     * @returns {promise} A promise object
     * @public
     */
    removeNotificationTarget: function (guid, targetId) {
      return this.apiManager.retrieve('cloud-foundry.api.HceNotificationApi')
        .removeNotificationTarget(guid, targetId, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function triggerPipelineExecution
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Trigger pipeline execution for project and commit ref
     * @param {string} guid - the HCE instance GUID
     * @param {number} projectId - the project ID
     * @param {string} commitRef - the commit ref
     * @returns {promise} A promise object
     * @public
     */
    triggerPipelineExecution: function (guid, projectId, commitRef) {
      var data = {
        project_id: projectId,
        commit_ref: commitRef
      };

      return this.apiManager.retrieve('cloud-foundry.api.HcePipelineApi')
        .triggerPipelineExecution(guid, data, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function onGetBuildContainers
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache build container
     * @param {string} response - the JSON response from API call
     * @private
     */
    onGetBuildContainers: function (response) {
      this.data.buildContainers.length = 0;
      [].push.apply(this.data.buildContainers, response.data || []);
    },

    /**
     * @function onGetDeploymentTargets
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache deployment targets
     * @param {string} response - the JSON response from API call
     * @private
     */
    onGetDeploymentTargets: function (response) {
      this.data.deploymentTargets.length = 0;
      [].push.apply(this.data.deploymentTargets, response.data || []);
    },

    /**
     * @function onGetImageRegistries
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache image registries
     * @param {string} response - the JSON response from API call
     * @private
     */
    onGetImageRegistries: function (response) {
      this.data.imageRegistries.length = 0;
      [].push.apply(this.data.imageRegistries, response.data || []);
    },

    /**
     * @function onGetProjects
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache user projects
     * @param {string} response - the JSON response from API call
     * @returns {array} An array of the user's projects
     * @private
     */
    onGetProjects: function (response) {
      var projects = response.data;
      this.data.projects = _.keyBy(projects, 'name') || {};
      return projects;
    },

    /**
     * @function onCreateDeploymentTarget
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache deployment target
     * @param {string} response - the JSON response from API call
     * @returns {object} The new deployment target data
     * @private
     */
    onCreateDeploymentTarget: function (response) {
      var target = response.data;
      delete target.userName;       // don't save user login name
      delete target.password;       // don't save user password
      this.data.deploymentTargets.push(target);

      return target;
    },

    /**
     * @function onGetPipelineExecutions
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Cache pipeline executions
     * @param {string} response - the JSON response from API call
     * @private
     */
    onGetPipelineExecutions: function (response) {
      this.data.pipelineExecutions.length = 0;
      [].push.apply(this.data.pipelineExecutions, response.data || []);
    },

    /**
     * @function onGetPipelineEvents
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Extract data from response
     * @param {string} response - the JSON response from API call
     * @returns {object} The collection of pipeline events
     * @private
     */
    onGetPipelineEvents: function (response) {
      return response.data;
    },

    onGetVcses: function (response) {
      this.data.vcsInstances = response.data;
      return response.data;
    },

    onListVcsTypes: function (response) {
      var vcsTypes = response.data;
      this.data.vcsTypes = _.keyBy(vcsTypes, 'vcs_type') || {};
      return response.data;
    },

    /**
     * @function onDownloadArtifact
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Extract data from response
     * @param {string} response - the JSON response from API call
     * @returns {object} Artifact content
     * @private
     */
    onDownloadArtifact: function (response) {
      return response.data;
    },

    /**
     * @function onLogout
     * @memberof cloud-foundry.model.hce.HceModel
     * @description Clear the data on logout
     * @returns {void}
     * @private
     */
    onLogout: function () {
      this.data = {
        buildContainers: [],
        deploymentTargets: [],
        imageRegistries: [],
        projects: {},
        pipelineExecutions: []
      };
    }

  });

})();
