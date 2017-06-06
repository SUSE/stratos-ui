(function () {
  'use strict';

  angular
    .module('app.framework.widgets')
    .directive('radioInput', radioInput);

  /**
   * @namespace app.framework.widgets.radioInput
   * @memberof app.framework.widgets
   * @name radioInput
   * @description A radio input directive with custom style
   * @returns {object} The radio-input directive definition object
   */
  function radioInput() {
    return {
      bindToController: {
        inputDisabled: '=?',
        inputLabel: '@?',
        inputValue: '='
      },
      controller: RadioInputController,
      controllerAs: 'radioInputCtrl',
      link: link,
      require: ['radioInput', 'ngModel'],
      restrict: 'E',
      scope: {},
      templateUrl: 'framework/widgets/radio-input/radio-input.html'
    };

    function link(scope, element, attrs, ctrls) {
      var radioInputCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];

      element.on('click', handleClick);
      element.on('keypress', handleKeypress);

      // watch for model change to set 'checked' class
      scope.$watch(function () {
        return ngModelCtrl.$modelValue;
      }, function (newValue) {
        radioInputCtrl.checked = newValue === radioInputCtrl.inputValue;
      });

      // On click, set the model view value
      function handleClick() {
        scope.$apply(function () {
          if (!radioInputCtrl.inputDisabled) {
            ngModelCtrl.$setViewValue(radioInputCtrl.inputValue);
          }
        });
      }

      // On keypress (space or enter), set the model view value
      function handleKeypress(event) {
        var enterSpaceKeyCodes = [13, 32];
        var keyCode = event.which || event.keyCode;

        if (enterSpaceKeyCodes.indexOf(keyCode) !== -1) {
          event.preventDefault();
          handleClick();
        }
      }
    }
  }

  /**
   * @namespace app.framework.widgets.RadioInputController
   * @memberof app.framework.widgets
   * @name RadioInputController
   * @constructor
   */
  function RadioInputController() {
  }

})();
