(function (mock) {
  'use strict';

  /* eslint-disable quote-props */
  mock.hceApi = mock.hceApi || {};

  mock.hceApi.HceProjectApi = {

    createProject: function (name, targetId, buildContainerId, repo, branch) {
      return {
        url: '/pp/v1/proxy/v2/projects',
        response: {
          201: {
            body: {
              guid: {
                id: 1,
                name: name,
                build_container_id: buildContainerId,
                branchRefName: branch,
                deployment_target_id: targetId,
                token: 'GithubToken',
                repo: repo
              }
            }
          },

          500: {
            body: { guid: {} }
          }
        }
      };
    }
  };

  /* eslint-enable quote-props */
})(this.mock = this.mock || {});
