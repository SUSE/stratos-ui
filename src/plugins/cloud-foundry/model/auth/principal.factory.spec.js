(function () {
  'use strict';

  describe('cloud-foundry auth model', function () {
    var principalFactory;

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));
    beforeEach(inject(function ($injector) {
      var modelManager = $injector.get('app.model.modelManager');
      principalFactory = modelManager.retrieve('cloud-foundry.model.auth.principalFactory');
    }));

    it('should be admin', function () {
      var principal = principalFactory.create({
        isAdmin: true
      });
      expect(principal.isAdmin).toBeTruthy();
    });

    it('should not be admin', function () {
      var principal = principalFactory.create({
        isAdmin: false
      });
      expect(principal.isAdmin).toBeFalsy();
    });

    it('should have access to an operation through flags', function () {
      var principal = principalFactory.create({isAdmin: false});
      expect(principal.hasAccessTo('user_org_creation', {add: {}})).toBeTruthy();
    });

    it('should have access to an operation through admin', function () {
      var principal = principalFactory.create({isAdmin: true});
      expect(principal.hasAccessTo('add', {})).toBeTruthy();
    });

    it('should not have access to an operation if not admin and no flags', function () {
      var principal = principalFactory.create({isAdmin: false});
      expect(principal.hasAccessTo('add', {})).toBeFalsy();
    });

    it('should have access to create for service instance access if admin', function () {
      var principal = principalFactory.create({isAdmin: true});
      expect(principal.isAllowed('appContext',
        'managed_service_instance',
        'create', {})).toBeTruthy();
    });

    it('should have access to update for application access if admin', function () {
      var principal = principalFactory.create({isAdmin: true});
      expect(principal.isAllowed('appContext',
        'application',
        'update', {})).toBeTruthy();
    });

    it('should have access to delete for organization access if admin', function () {
      var principal = principalFactory.create({isAdmin: true});
      expect(principal.isAllowed('appContext',
        'organization',
        'delete', {})).toBeTruthy();
    });

    it('should have access to create for route access if admin', function () {
      var principal = principalFactory.create({isAdmin: true});
      expect(principal.isAllowed('appContext',
        'route',
        'create', {}
      )).toBeTruthy();
    });

  });

})();
