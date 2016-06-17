(function() {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-logs')
    .controller('triggerBuildsDetailViewController', TriggerBuildsDetailViewController);

  TriggerBuildsDetailViewController.$inject = [
    '$timeout',
    '$uibModalInstance',
    'context',
    'content',
    'app.model.modelManager',
    'github.view.githubOauthService'
  ];

  /**
   * @name TriggerBuildsDetailViewController
   * @constructor
   * @param {object} $timeout - the angular timeout service
   * @param {object} $uibModalInstance - the modal object which is associated with this controller
   * @param {object} context - parameter object passed in to DetailView
   * @param {object} content - configuration object passed in to DetailView
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {object} githubOauthService - Service to obtain github auth creds
   */
  function TriggerBuildsDetailViewController($timeout, $uibModalInstance, context, content, modelManager, githubOauthService) {
    var that = this;
    that.context = context;
    that.content = content;
    that.hasToken = false;
    that.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    that.githubModel = modelManager.retrieve('cloud-foundry.model.github');
    that.$uibModalInstance = $uibModalInstance;
    that.$timeout = $timeout;
    that.githubOauthService = githubOauthService;

    // Always initially attempt to fetch commits associated with this projects repo/branch
    that.fetchCommits();
  }

  angular.extend(TriggerBuildsDetailViewController.prototype, {

    build: function() {
      var that = this;

      that.triggerError = false;

      that.hceModel.triggerPipelineExecution(that.context.guid, that.context.project.id, that.selectedCommit.sha)
        .then(function() {
          // Success, cause successful promise for modal
          that.$uibModalInstance.close();
        })
        .catch(function() {
          that.triggerError = true;
        });
    },

    fetchCommits: function() {
      var that = this;

      this.hasToken = that.githubModel.getToken();
      if (!this.hasToken) {
        return;
      }

      that.fetchError = undefined;

      this.githubModel.commits(this.context.project.repo.full_name, this.context.project.repo.branch, 20)
        .then(function() {
          that.fetchError = false;
          that.selectedCommit = _.get(that, 'githubModel.data.commits.length') ? that.githubModel.data.commits[0] : null;
        })
        .catch(function() {
          that.fetchError = true;
        });
    },

    githubAuth: function() {
      var that = this;
      that.githubOauthService.start()
        .then(function() {
          that.fetchCommits();
        })
        .catch(function() {
          that.githubAuthFailed = true;
        });
    }


  });
})();
