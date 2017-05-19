(function () {
  'use strict';

  angular
    .module('helion.framework.widgets')
    .directive('passwordReveal', passwordReveal);

  function passwordReveal($compile) {
    return {
      link: function (scope, element) {
        scope.showPassword = false;

        var markup = '<i class="material-icons password-reveal form-control-feedback text-muted">visibility</i>';
        var eyeElement = angular.element(markup);

        eyeElement.on('click', function clickHandler() {
          scope.showPassword = !scope.showPassword;

          var inputType = scope.showPassword ? 'text' : 'password';
          element.attr('type', inputType);
          eyeElement.toggleClass('text-muted');
        });

        element.after(eyeElement);

        $compile(eyeElement)(scope);
      },
      restrict: 'A',
      scope: {
      }
    };
  }

})();
