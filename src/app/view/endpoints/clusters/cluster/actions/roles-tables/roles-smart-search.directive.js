(function () {
  'use strict';

  angular
    .module('app.view.endpoints.clusters.cluster')
    .directive('rolesSmartSearch', RolesSmartSearch);

  /**
   * @memberof app.view.endpoints.clusters.cluster
   * @name RolesSmartSearch
   * @description The angular smart table directive has a good search. However applying the same search term to multiple
   * smart tables is tricky. This can be achieved by using this directive
   * @constructor
   */
  function RolesSmartSearch() {
    return {
      require: '^stTable',
      restrict: 'A',
      scope: {
        rolesSmartSearch: '='
      },
      link: function (scope, ele, attr, ctrl) {
        scope.$watch('rolesSmartSearch', function (val) {
          ctrl.search(val, attr.rolesSmartSearchBy);
        });
      }
    };
  }
})();
