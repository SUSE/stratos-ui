(function () {
  'use strict';

  describe('cluster detail module', function () {

    var $controller, $httpBackend;

    beforeEach(module('templates'));
    beforeEach(module('console'));

    var clusterGuid = 'clusterGuid';

    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');

      var modelManager = $injector.get('modelManager');
      var apiManager = $injector.get('apiManager');
      var $stateParams = $injector.get('$stateParams');
      $stateParams.guid = clusterGuid;
      var $scope = $injector.get('$rootScope').$new();
      var utils = $injector.get('app.utils.utilsService');
      var $state = $injector.get('$state');
      var $q = $injector.get('$q');
      var modelUtils = $injector.get('modelUtils');
      var organizationModel = $injector.get('organization-model');

      var cliCommands = $injector.get('app.view.endpoints.clusters.cluster.cliCommands');

      var stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');
      _.set(stackatoInfo, 'info.endpoints.hcf.' + clusterGuid + '.user', {
        guid: 'user_guid',
        admin: true
      });

      var ClusterController = $state.get('endpoint.clusters.cluster.detail').controller;
      $controller = new ClusterController($stateParams, $scope, $state, $q, modelManager, apiManager,utils, cliCommands, modelUtils, organizationModel);

    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('initial state', function () {
      expect($controller).toBeDefined();
      expect($controller.guid).toEqual(clusterGuid);
      expect($controller.updateTotalApps).toBeDefined();
      expect($controller.initialized).toBeTruthy();
    });

  });

})();
