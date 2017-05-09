(function () {
  'use strict';

  describe('cluster space detail module', function () {

    var $controller, $httpBackend;

    beforeEach(module('templates'));
    beforeEach(module('console-app'));

    var clusterGuid = 'clusterGuid';
    var organizationGuid = 'organizationGuid';
    var spaceGuid = 'spaceGuid';

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');

      var modelManager = $injector.get('modelManager');
      var $state = $injector.get('$state');
      var $stateParams = $injector.get('$stateParams');
      $stateParams.guid = clusterGuid;
      $stateParams.organization = organizationGuid;
      $stateParams.space = spaceGuid;

      var $q = $injector.get('$q');
      var appUtilsService = $injector.get('appUtilsService');

      var ClusterSpaceController = $state.get('endpoint.clusters.cluster.organization.space.detail').controller;
      $controller = new ClusterSpaceController($q, $state, $stateParams, modelManager, appUtilsService);
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('initial state', function () {
      expect($controller).toBeDefined();
      expect($controller.space).toBeDefined();
      expect($controller.stateInitialised).toBeTruthy();
    });

  });

})();
