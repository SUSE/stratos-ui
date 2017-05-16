(function () {
  'use strict';

  describe('cloud-foundry vcs model', function () {
    var $httpBackend, vcsModel, modelManager;

    beforeEach(module('templates'));
    beforeEach(module('console-app'));
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      modelManager = $injector.get('modelManager');
      vcsModel = modelManager.retrieve('code-engine.model.vcs');
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('listVcsClients', function () {

      var vcsClients = [{
        browse_url: 'https://github.com',
        vcs_type: 'github'
      }];

      it('Nothing cached', function () {
        $httpBackend.expect('GET', '/pp/v1/vcs/clients').respond(200, vcsClients);

        vcsModel.listVcsClients().then(function (response) {
          expect(response).toEqual(vcsClients);
        });

        $httpBackend.flush();
        expect(vcsModel.vcsClients).toEqual(vcsClients);
      });

      it('force, but nothing cached', function () {
        $httpBackend.expect('GET', '/pp/v1/vcs/clients').respond(200, vcsClients);

        vcsModel.listVcsClients().then(function (response) {
          expect(response).toEqual(vcsClients);
        });

        $httpBackend.flush();
        expect(vcsModel.vcsClients).toEqual(vcsClients);
      });

      it('failed call does not change vcsClients', function () {
        $httpBackend.expect('GET', '/pp/v1/vcs/clients').respond(500, {});
        vcsModel.vcsClients = 'should not change';

        vcsModel.listVcsClients().then(function () {
          fail('Failed call should not result in resolved promise');
        });

        $httpBackend.flush();
        expect(vcsModel.vcsClients).toEqual('should not change');
      });

    });

  });

})();
