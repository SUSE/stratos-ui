(function () {
  'use strict';

  angular
    .module('app.framework.utils')
    .directive('focusableInput', focusableInput);

  /**
   * @name focusableInput
   * @description A utility directive to toggle 'focus' class on
   * the decorated element when child input is focused on or
   * blurred. To use a custom class instead of the default,
   * specify the attribute value.
   * @returns {*}
   * @example
   * <div focusable-input>
   *   <input type="text" value="This is focusable"/>
   * </div>
   * <div focusable-input="myCustomClass">
   *   <input type="text" value="This is focusable"/>
   * </div>
   */
  function focusableInput() {
    return {
      link: function (scope, element) {
        var focusedClass = scope.focusedClass || 'focus';

        element.find('input').on('focus', handleOnFocus);
        element.find('select-input').on('focus', handleOnFocus);
        element.find('tags-input').on('focus', handleOnFocus);
        element.find('textarea').on('focus', handleOnFocus);
        element.find('input').on('blur', handleOnBlur);
        element.find('select-input').on('blur', handleOnBlur);
        element.find('tags-input').on('blur', handleOnBlur);
        element.find('textarea').on('blur', handleOnBlur);

        function handleOnFocus() {
          element.addClass(focusedClass);
        }

        function handleOnBlur() {
          element.removeClass(focusedClass);
        }
      },
      restrict: 'A',
      scope: {
        focusedClass: '@focusableInput'
      }
    };
  }

})();
