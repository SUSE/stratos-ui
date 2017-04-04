(function () {
  'use strict';

  describe('cli-commands service test', function () {

    var cliCommandsFactory, detailViewCalled, $q;
    var name = 'foobar';

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));
    beforeEach(module(function ($provide) {
      var mock = function () {
        detailViewCalled = true;
        return {rendered: $q.resolve(), result: $q.reject()};
      };
      $provide.value('frameworkDetailView', mock);
    }));

    beforeEach(inject(function ($injector, _$q_) {
      $q = _$q_;
      cliCommandsFactory = $injector.get('cloud-foundry.view.applications.application.summary.cliCommands');
    }));

    it('should be defined', function () {
      expect(cliCommandsFactory).toBeDefined();
    });

    it('should invoke frameworkDetailView', function () {
      cliCommandsFactory.show({
        organization: {
          entity: {
            name: name
          }
        },
        space: {
          entity: {
            name: name
          }
        },
        summary: {
          name: name
        }
      });
      expect(detailViewCalled).toBe(true);
    });
  });
})();
