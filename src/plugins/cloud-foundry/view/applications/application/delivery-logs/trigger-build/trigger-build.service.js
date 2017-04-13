(function () {
  'use strict';

  /**
   * @name cloud-foundry.view.applications.application.delivery-logs.triggerBuildDetailView
   * @description Service to trigger a build from a selection of recent commits
   **/
  angular
    .module('cloud-foundry.view.applications.application.delivery-logs')
    .factory('triggerBuildDetailView', triggerBuildDetailView);

  function triggerBuildDetailView(frameworkDetailView) {
    return {
      /**
       * @function open
       * @description Open a detail-view showing selection of commits that can be built against
       * @param {object} project - project to build
       * @param {string} cnsiGuid - cnsi to find the event log at
       * @returns {object} The resolved/rejected promise
       * @public
       **/
      open: function (project, cnsiGuid) {
        return frameworkDetailView({
          templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/trigger-build/trigger-build.html',
          title: gettext('Select a Commit'),
          controller: TriggerBuildsDetailViewController
        }, {
          guid: cnsiGuid,
          project: project
        }).result;
      }
    };
  }

  /**
   * @name TriggerBuildsDetailViewController
   * @constructor
   * @param {object} $timeout - the angular timeout service
   * @param {object} $uibModalInstance - the modal object which is associated with this controller
   * @param {object} $q - the angular $q service
   * @param {object} appManageVcsTokens - the VCS token manager
   * @param {object} context - parameter object passed in to frameworkDetailView
   * @param {object} content - configuration object passed in to frameworkDetailView
   * @param {app.model.modelManager} modelManager - the Model management service
   */
  function TriggerBuildsDetailViewController($timeout, $uibModalInstance, $q, appManageVcsTokens, context, content, modelManager) {
    var that = this;
    that.context = context;
    that.content = content;
    that.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    that.githubModel = modelManager.retrieve('github.model');
    that.$uibModalInstance = $uibModalInstance;
    that.$timeout = $timeout;
    that.$q = $q;
    that.appManageVcsTokens = appManageVcsTokens;

    // Always initially attempt to fetch commits associated with this projects repo/branch
    that.fetchCommits();
  }

  angular.extend(TriggerBuildsDetailViewController.prototype, {

    build: function (skipUpdate) {
      var that = this;

      that.triggerError = false;
      that.triggering = true;

      return that.hceModel.triggerPipelineExecution(that.context.guid, that.context.project.id, that.selectedCommit.sha)
        .then(function () {
          // Success, cause successful promise for modal
          that.$uibModalInstance.close();
        })
        .catch(function () {
          if (skipUpdate) {
            that.triggerError = true;
          } else {
            that._checkPatAndBuild()
              .catch(function () {
                that.triggerError = true;
              })
              .finally(function () {
                that.triggering = false;
              });
          }
        });
    },

    _getPatGuid: function () {
      return this.appManageVcsTokens.getPatGuid(this.context.project.name);
    },

    _checkPatAndBuild: function () {
      var that = this;

      var patGuid = this._getPatGuid();
      if (!patGuid) {
        return this.$q.reject('You must associate a valid PAT before triggering a build');
      }

      return that.build(true);
    },

    fetchCommits: function () {
      var that = this;
      this.fetching = true;

      var githubOptions = {
        headers: {
          'x-cnap-vcs-token-guid': this._getPatGuid()
        }
      };
      that.githubModel.commits(that.context.project.repo.full_name, that.context.project.repo.branch, 20, githubOptions)
        .then(function () {
          that.fetching = false;
          that.fetchError = false;
          that.permissionError = false;
          that.selectedCommit =
            _.get(that, 'githubModel.data.commits.length') ? that.githubModel.data.commits[0] : null;
        })
        .catch(function (response) {
          if (response.status === 401) {
            that.tokenInvalid = true;
          } else if (response.status === 404) {
            that.permissionError = true;
          } else {
            that.fetchError = true;
          }

          that.fetching = false;
        });
    }

  });

})();
