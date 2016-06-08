(function () {
  'use strict';

  describe('user service instance API', function () {
    var $httpBackend, $httpParamSerializer, serviceInstanceApi;

    beforeEach(module('green-box-console'));
    beforeEach(inject(function ($injector) {
      $httpBackend = $injector.get('$httpBackend');
      $httpParamSerializer = $injector.get('$httpParamSerializer');

      var apiManager = $injector.get('app.api.apiManager');
      serviceInstanceApi = apiManager.retrieve('app.api.serviceInstance');
    }));

    afterEach(function () {
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    it('should be defined', function () {
      expect(serviceInstanceApi).toBeDefined();
    });

    it('should have `$http` property defined', function () {
      expect(serviceInstanceApi.$http).toBeDefined();
    });

    it('should send POST request for create()', function () {
      var mockRespondData = { id: 1, url: 'url', name: 'name' };
      var postData = $httpParamSerializer({ api_endpoint: 'url', cnsi_name: 'name' });
      $httpBackend.expectPOST('/pp/v1/register/hcf', postData)
        .respond(200, mockRespondData);
      serviceInstanceApi.create('url', 'name')
        .then(function (response) {
          expect(response.data).toEqual({ id: 1, url: 'url', name: 'name' });
        });
      $httpBackend.flush();
    });

    it('should return all service instances (master list)', function () {
      var data = ['x','y','z'];
      $httpBackend.when('GET', '/pp/v1/cnsis').respond(200, data);

      serviceInstanceApi.list().then(function (response) {
        expect(response.data).toEqual(['x','y','z']);
      });

      $httpBackend.flush();
    });

    it('should send DELETE request for remove()', function () {
      $httpBackend.expectDELETE('/api/service-instances/1').respond(200, '');
      serviceInstanceApi.remove(1);
      $httpBackend.flush();
    });
  });

})();
