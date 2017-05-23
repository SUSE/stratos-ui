(function () {
  'use strict';

  /**
   * @namespace code-engine.model.hce
   * @memberOf code-engine.model
   * @name hce
   * @description Helion Code Engine model
   */
  angular
    .module('code-engine.model')
    .run(registerHceModel);

  function registerHceModel(modelManager, apiManager, appEventService, $log) {
    modelManager.register('code-engine.model.hce', new HceModel(apiManager, appEventService, $log));
  }

  /**
   * @memberof code-engine.model.hce
   * @name HceModel
   * @param {app.api.apiManager} apiManager - the application API manager
   * @param {app.utils.appEventService} appEventService - the application event service
   * @param {object} $log - Angular $log service
   * @property {app.api.apiManager} apiManager - the application API manager
   * @property {app.utils.appEventService} appEventService - the application event service
   * @property {object} data - the Helion Code Engine data
   * @class
   */
  function HceModel(apiManager, appEventService, $log) {
    var that = this;
    this.apiManager = apiManager;
    this.appEventService = appEventService;
    this.$log = $log;
    this.data = {
      buildContainers: [],
      deploymentTargets: [],
      imageRegistries: [],
      projects: [],
      pipelineExecutions: [],
      vcsInstances: [],
      vcsTypes: [],
      notificationTargetTypes: []
    };

    var baseNotificationData = {
      tokenLabel: 'ce.tokens.token',
      tokenErrorLabel: 'ce.tokens.required-error'
    };

    // This will be provided by Code Engine in future
    this.staticNotificationData = {
      hipchat: {
        title: 'ce.notifications.hipchat.title',
        description: 'ce.notifications.hipchat.description',
        endpointLabel: 'ce.notifications.hipchat.endpoint-label',
        endpointErrorLabel: 'ce.notifications.hipchat.endpoint-error-label',
        img: 'hipchat_logo.png',
        imgScale: 0.8
      },
      httpPost: {
        title: 'ce.notifications.http.title',
        description: 'ce.notifications.http.description',
        endpointLabel: 'ce.notifications.http.endpoint-label',
        endpointErrorLabel: 'ce.notifications.http.endpoint-error-label',
        img: 'httppost_logo.png',
        imgScale: 0.8
      },
      flowdock: {
        title: 'ce.notifications.flowdock.title',
        description: 'ce.notifications.flowdock.description',
        endpointLabel: 'ce.notifications.flowdock.endpoint-label',
        endpointErrorLabel: 'ce.notifications.flowdock.endpoint-error-label',
        img: 'flowdock_logo.png',
        imgScale: 0.75
      },
      slack: {
        title: 'ce.notifications.slack.title',
        description: 'ce.notifications.slack.description',
        endpointLabel: 'ce.notifications.slack.endpoint-label',
        endpointErrorLabel: 'ce.notifications.slack.endpoint-error-label',
        tokenLabel: 'ce.notifications.slack.token-label',
        tokenErrorLabel: 'ce.notifications.slack.token-error-label',
        img: 'slack.png',
        imgScale: 0.75
      }
    };

    // Fill in defaults
    _.each(this.staticNotificationData, function (val, key) {
      that.staticNotificationData[key] = _.defaults(val, baseNotificationData);
    });

    this.appEventService.$on(this.appEventService.events.LOGOUT, function () {
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
     * @memberof code-engine.model.hce.HceModel
     * @description Get service info for one or more HCE instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    infos: function (guid) {
      return this.apiManager.retrieve('code-engine.api.HceInfoApi')
        .info(guid, {});
    },

    /**
     * @function info
     * @memberof code-engine.model.hce.HceModel
     * @description Get service info for an HCE instance
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    info: function (guid) {
      return this.apiManager.retrieve('code-engine.api.HceInfoApi')
        .info(guid, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getBuildContainer
     * @memberof code-engine.model.hce.HceModel
     * @description Get build container by ID
     * @param {string} guid - the HCE instance GUID
     * @param {number} id - the build container ID
     * @returns {promise} A promise object
     * @public
     */
    getBuildContainer: function (guid, id) {
      return this.apiManager.retrieve('code-engine.api.HceContainerApi')
        .getBuildContainer(guid, id, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getBuildContainers
     * @memberof code-engine.model.hce.HceModel
     * @description Get registered build container instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getBuildContainers: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceContainerApi')
        .getBuildContainers(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetBuildContainers(response);
        });
    },

    /**
     * @function getDeploymentTarget
     * @memberof code-engine.model.hce.HceModel
     * @description Get deployment target by ID
     * @param {string} guid - the HCE instance GUID
     * @param {number} id - the deployment target ID
     * @returns {promise} A promise object
     * @public
     */
    getDeploymentTarget: function (guid, id) {
      return this.apiManager.retrieve('code-engine.api.HceDeploymentApi')
        .getDeploymentTarget(guid, id, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getDeploymentTargets
     * @memberof code-engine.model.hce.HceModel
     * @description Get registered deployment targets
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getDeploymentTargets: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceDeploymentApi')
        .getDeploymentTargets(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetDeploymentTargets(response);
        });
    },

    /**
     * @function getImageRegistries
     * @memberof code-engine.model.hce.HceModel
     * @description Get registered image registries
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getImageRegistries: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceContainerApi')
        .getImageRegistries(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetImageRegistries(response);
        });
    },

    /**
     * @function getNotificationTargets
     * @memberof code-engine.model.hce.HceModel
     * @description Get notification targets for project
     * @param {string} guid - the HCE instance GUID
     * @param {number} projectId - the project ID
     * @returns {promise} A promise object
     * @public
     */
    getNotificationTargets: function (guid, projectId) {
      return this.apiManager.retrieve('code-engine.api.HceNotificationApi')
        .getNotificationTargets(guid, {project_id: projectId}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function filterNotificationTargets
     * @memberof code-engine.model.hce.HceModel
     * @description Filter notification targets to include only those that should be shown
     * @param {object} targets - Array of notification targets
     * @returns {object} A filtered array of notification targets
     * @public
     */
    filterNotificationTargets: function (targets) {
      var that = this;
      var filtered = [];
      if (targets) {
        filtered = _.filter(targets, function (target) {
          return target.type && that.staticNotificationData[target.type] &&
          !that.staticNotificationData[target.type].hidden;
        });
      }
      return filtered;
    },

    /**
     * @function getPipelineTasks
     * @memberof code-engine.model.hce.HceModel
     * @description Get post-deploy pipeline tasks for project
     * @param {string} guid - the HCE instance GUID
     * @param {number} projectId - the project ID
     * @returns {promise} A promise object
     * @public
     */
    getPipelineTasks: function (guid, projectId) {
      var params = {};
      if (projectId) {
        params = {project_id: projectId};
      }
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .getPipelineTasks(guid, params, this.hceProxyPassthroughConfig);
    },

    /**
     * @function addPipelineTask
     * @memberof code-engine.model.hce.HceModel
     * @description Add a post-deploy pipeline task to a project
     * @param {string} guid - the HCE instance GUID
     * @param {string} projectId - the project ID
     * @param {string} taskLabel - label for the task
     * @param {number} credentialId - Credential ID for task
     * @param {object} metadata - metadata for post-deploy task
     * @returns {promise} A promise object
     * @public
     */
    addPipelineTask: function (guid, projectId, taskLabel, credentialId, metadata) {

      var data = {
        // NOTE: Currently `stormrunner` is the only post-deploy action supported
        task_type: 'stormrunner',
        task_label: taskLabel,
        project_id: projectId,
        credential_id: credentialId,
        metadata: angular.toJson(metadata)
      };

      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .addPipelineTask(guid, data, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function removePipelineTask
     * @memberof code-engine.model.hce.HceModel
     * @description Remove a post-deploy pipeline task to a project
     * @param {string} guid - the HCE instance GUID
     * @param {!number} taskId - The PipelineTask id to remove.
     * @returns {promise} A promise object
     * @public
     */
    removePipelineTask: function (guid, taskId) {

      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .removePipelineTask(guid, taskId, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function listNotificationTargetTypes
     * @memberof code-engine.model.hce.HceModel
     * @description Get notification targets for project
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    listNotificationTargetTypes: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceNotificationApi')
        .listNotificationTargetTypes(guid, null, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onListNotificationTargetTypes(response);
        });
    },

    /**
     * @function getProject
     * @memberof code-engine.model.hce.HceModel
     * @description Get project by ID
     * @param {string} guid - the HCE instance GUID
     * @param {number} projectId - the HCE project ID
     * @returns {promise} A promise object
     * @public
     */
    getProject: function (guid, projectId) {
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .getProject(guid, projectId, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function getProjectByName
     * @memberof code-engine.model.hce.HceModel
     * @description Get project by name
     * @param {string} guid - the HCE instance GUID
     * @param {number} name - the HCE project name
     * @param {object} params - additional query params
     * @returns {promise} A promise object
     * @public
     */
    getProjectByName: function (guid, name, params) {
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .getProjects(guid, params, this.hceProxyPassthroughConfig)
        .then(function (response) {
          var projects = response.data || [];
          return _.find(projects, {name: name});
        });
    },

    /**
     * @function getProjects
     * @memberof code-engine.model.hce.HceModel
     * @description Get projects of user
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getProjects: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .getProjects(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetProjects(response);
        });
    },

    /**
     * @function getPipelineExecutions
     * @memberof code-engine.model.hce.HceModel
     * @description Get executions by project ID
     * @param {string} guid - the HCE instance GUID
     * @param {string} projectId - the HCE project ID
     * @returns {promise} A promise object
     * @public
     */
    getPipelineExecutions: function (guid, projectId) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HcePipelineApi')
        .getPipelineExecutions(guid, {project_id: projectId}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.onGetPipelineExecutions(response);
        });
    },

    /**
     * @function getPipelineEvents
     * @memberof code-engine.model.hce.HceModel
     * @description Get events by execution ID
     * @param {string} guid - the HCE instance GUID
     * @param {string} executionId - the HCE execution ID that owns the events
     * @returns {promise} A promise object
     * @public
     */
    getPipelineEvents: function (guid, executionId) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HcePipelineApi')
        .getPipelineEvents(guid, {execution_id: executionId}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetPipelineEvents(response);
        });
    },

    /**
     * @function getVcses
     * @memberof code-engine.model.hce.HceModel
     * @description Get VCS instances
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    getVcses: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceVcsApi')
        .getVcses(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetVcses(response);
        });
    },

    /**
     * @function getVcs
     * @memberof code-engine.model.hce.HceModel
     * @description Get VCS instance
     * @param {string} guid - the HCE instance GUID
     * @param {number} vcsId - the VCS instance ID
     * @returns {promise} A promise object
     * @public
     */
    getVcs: function (guid, vcsId) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceVcsApi')
        .getVcs(guid, vcsId, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onGetVcs(response);
        });
    },

    /**
     * @function listVcsTypes
     * @memberof code-engine.model.hce.HceModel
     * @description Get VCS types
     * @param {string} guid - the HCE instance GUID
     * @returns {promise} A promise object
     * @public
     */
    listVcsTypes: function (guid) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceVcsApi')
        .listVcsTypes(guid, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onListVcsTypes(response);
        });
    },

    /**
     * @function createDeploymentTarget
     * @memberof code-engine.model.hce.HceModel
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

      return this.apiManager.retrieve('code-engine.api.HceDeploymentApi')
        .addDeploymentTarget(guid, newTarget, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onCreateDeploymentTarget(response);
        });
    },

    /**
     * @function updateDeploymentTarget
     * @memberof code-engine.model.hce.HceModel
     * @description Update a deployment target
     * @param {string} guid - the HCE instance GUID
     * @param {string} targetId - the deployment target ID
     * @param {object} data - the updated deployment target data
     * @returns {promise} A promise object
     * @public
     */
    updateDeploymentTarget: function (guid, targetId, data) {
      return this.apiManager.retrieve('code-engine.api.HceDeploymentApi')
        .updateTarget(guid, targetId, data, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function createCfBinding
     * @memberof code-engine.model.hce.HceModel
     * @description Create a Cloud Foundry service instance binding to the application
     * @param {string} guid - the HCE instance GUID
     * @param {string} projectId - the project ID
     * @param {string} appGuid - the application GUID
     * @returns {promise} A promise object
     * @public
     */
    createCfBinding: function (guid, projectId, appGuid) {
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .createCfBinding(guid, projectId, {cf_app_guid: appGuid}, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function createProject
     * @memberof code-engine.model.hce.HceModel
     * @description Create a new project
     * @param {string} guid - the HCE instance GUID
     * @param {string} name - the project name
     * @param {string} vcs - the VCS type
     * @param {number} targetId - the deployment target ID
     * @param {number} buildContainerId - the build container ID
     * @param {object} repo - the repo to use
     * @param {string} branch - the branch to use
     * @param {string} tokenGuid - the guid of the VCS token to use
     * @returns {promise} A promise object
     * @public
     */
    createProject: function (guid, name, vcs, targetId, buildContainerId, repo, branch, tokenGuid) {
      var newProject = {
        name: name,
        vcs_id: vcs.vcs_id,
        build_container_id: buildContainerId,
        deployment_target_id: targetId,
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

      // Special header to insert Github token
      var headers = angular.extend(
        {
          'x-cnap-vcs-token-guid': tokenGuid
        },
        this.hceProxyPassthroughConfig.headers
      );

      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .createProject(guid, newProject, {}, {headers: headers});
    },

    /**
     * @function updateProject
     * @memberof code-engine.model.hce.HceModel
     * @description Update an existing project
     * @param {string} guid - the HCE instance GUID
     * @param {string} tokenGuid - the ID of the VCS token to use
     * @param {number} projectId - the HCE project ID to update
     * @param {object} data - the new project data
     * @returns {promise} A promise object
     * @public
     */
    updateProject: function (guid, tokenGuid, projectId, data) {
      // Special header to insert Github token
      var headers = angular.extend(
        {
          'x-cnap-vcs-token-guid': tokenGuid
        },
        this.hceProxyPassthroughConfig.headers
      );

      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .updateProject(guid, projectId, data, {}, {headers: headers});
    },

    /**
     * @function downloadArtifact
     * @memberof code-engine.model.hce.HceModel
     * @description Download the artifact associated with the artifact ID.
     * @param {string} guid - the HCE instance GUID
     * @param {string} artifactId - the HCE artifact ID
     * @returns {promise} A promise object.
     * @public
     */
    downloadArtifact: function (guid, artifactId) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceArtifactApi')
        .downloadArtifact(guid, artifactId, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          return that.onDownloadArtifact(response);
        });
    },

    removeProject: function (guid, projectId) {
      var that = this;
      return this.apiManager.retrieve('code-engine.api.HceProjectApi')
        .deleteProject(guid, projectId, {}, this.hceProxyPassthroughConfig)
        .then(function (response) {
          that.getProjects(guid);
          return response;
        });
    },

    /**
     * @function removeNotificationTarget
     * @memberof code-engine.model.hce.HceModel
     * @description Remove notification target
     * @param {string} guid - the HCE instance GUID
     * @param {number} targetId - the notification target ID
     * @returns {promise} A promise object
     * @public
     */
    removeNotificationTarget: function (guid, targetId) {
      return this.apiManager.retrieve('code-engine.api.HceNotificationApi')
        .removeNotificationTarget(guid, targetId, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function triggerPipelineExecution
     * @memberof code-engine.model.hce.HceModel
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

      return this.apiManager.retrieve('code-engine.api.HcePipelineApi')
        .triggerPipelineExecution(guid, data, {}, this.hceProxyPassthroughConfig);
    },

    /**
     * @function onGetBuildContainers
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
     * @description Cache user projects
     * @param {string} response - the JSON response from API call
     * @returns {array} An array of the user's projects
     * @private
     */
    onGetProjects: function (response) {
      var projects = response.data;
      this.data.projects = projects;
      return projects;
    },

    /**
     * @function onCreateDeploymentTarget
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
     * @description Extract data from response
     * @param {string} response - the JSON response from API call
     * @returns {object} The collection of pipeline events
     * @private
     */
    onGetPipelineEvents: function (response) {
      return response.data;
    },

    /**
     * @function onGetVcses
     * @memberof code-engine.model.hce.HceModel
     * @description Extract VCS instances data from response
     * @param {object} response - the JSON response from API call
     * @returns {object} The response data
     * @private
     */
    onGetVcses: function (response) {
      this.data.vcsInstances = response.data;
      return response.data;
    },

    /**
     * @function onGetVcs
     * @memberof code-engine.model.hce.HceModel
     * @description Extract VCS instance data from response
     * @param {object} response - the JSON response from API call
     * @returns {object} The response data
     * @private
     */
    onGetVcs: function (response) {
      this.data.vcsInstance = response.data;
      return response.data;
    },

    /**
     * @function onListVcsTypes
     * @memberof code-engine.model.hce.HceModel
     * @description Extract VCS types data from response
     * @param {object} response - the JSON response from API call
     * @returns {object} The response data
     * @private
     */
    onListVcsTypes: function (response) {
      var vcsTypes = response.data;
      this.data.vcsTypes = _.keyBy(vcsTypes, 'vcs_type') || {};
      return response.data;
    },

    /**
     * @function onDownloadArtifact
     * @memberof code-engine.model.hce.HceModel
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
     * @memberof code-engine.model.hce.HceModel
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
    },

    /**
     * @function onListNotificationTargetTypes
     * @memberof code-engine.model.hce.HceModel
     * @description store current notification target types
     * @param {object} response - HCE listNotificationTargetTypes response
     * @returns {void}
     * @private
     */
    onListNotificationTargetTypes: function (response) {
      var notificationTypes = response.data;
      var that = this;
      angular.forEach(notificationTypes, function (notificationType) {
        var staticNotificationData = that.staticNotificationData[notificationType.item_value];
        if (staticNotificationData && !staticNotificationData.hidden) {
          var typeData = _.assign(notificationType, staticNotificationData);
          if (!_.find(that.data.notificationTargetTypes, {item_value: notificationType.item_value})) {
            that.data.notificationTargetTypes.push(typeData);
          }
        }
      });
    }

  });

})();
