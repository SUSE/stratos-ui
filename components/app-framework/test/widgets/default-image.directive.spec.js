(function () {
  'use strict';

  describe('default-image directive', function () {
    var $compile, $scope, element;

    beforeEach(module('templates'));
    beforeEach(module('app.framework'));

    beforeEach(inject(function ($injector) {
      $compile = $injector.get('$compile');
      $scope = $injector.get('$rootScope').$new();
    }));

    function create(markup) {
      element = angular.element(markup);
      $compile(element)($scope);
      $scope.$apply();
    }

    it('should be defined', function () {
      var markup = '<img ng-src="images/brand_company_logo.png" default-image default-image-src="test-images/test_image.png"></img>';
      create(markup);
      expect(element).toBeDefined();
      expect(element.attr('src')).toBe('images/brand_company_logo.png');
      element.trigger('error');
      expect(element.attr('src')).toBe('test-images/test_image.png');
      $scope.$destroy();
    });

    it('should use default src when no src specified', function () {
      var markupEmpty = '<img ng-src="" default-image default-image-src="test-images/test_image.png"></img>';
      create(markupEmpty);
      expect(element.attr('src')).toBe('test-images/test_image.png');
    });
  });
})();
