(function () {
  'use strict';

  angular
    .module('helion.framework.widgets')
    .directive('selectInput', selectInput);

  /**
   * @namespace helion.framework.widgets.selectInput
   * @memberof helion.framework.widgets
   * @name selectInput
   * @description A select input directive that displays
   * a select input field with a dropdown menu with options.
   * @param {object} $document - the Angular $document service
   * @example
   * var options = [
   *   { label: 'Option 1', value: 1 },
   *   { label: 'Option 2', value: 2 }
   * ];
   * var inputModel = null;
   * <select-input ng-model="inputModel" input-options="options">
   * </select-input>
   * @returns {object} The select-input directive definition object
   */
  function selectInput($document) {
    return {
      bindToController: {
        addAction: '=?',
        inputOptions: '=',
        refreshAction: '=?',
        placeholder: '@?'
      },
      controller: SelectInputController,
      controllerAs: 'selectInputCtrl',
      link: link,
      require: ['selectInput', 'ngModel'],
      restrict: 'E',
      scope: {},
      templateUrl: 'framework/widgets/select-input/select-input.html'
    };

    function link(scope, element, attrs, ctrls) {
      var selectInputCtrl = ctrls[0];
      var ngModelCtrl = ctrls[1];

      ngModelCtrl.$render = function () {
        selectInputCtrl.setLabel(ngModelCtrl.$modelValue);
      };

      selectInputCtrl.ngModelCtrl = ngModelCtrl;

      element.on('click', handleClick);
      element.on('keypress', handleKeypress);

      $document.on('click', function (event) {
        if (!element[0].contains(event.target)) {
          scope.$apply(function () {
            selectInputCtrl.open = false;
          });
        }
      });

      function handleClick() {
        scope.$apply(function () {
          selectInputCtrl.toggleMenu();
        });
      }

      function handleKeypress(event) {
        var enterSpaceKeyCodes = [13, 32];    // enter or space
        var keyCode = event.which || event.keyCode;
        var charStr = String.fromCharCode(keyCode);

        if (keyCode === 27) {
          scope.$apply(function () {
            selectInputCtrl.open = false;
          });
        } else if (enterSpaceKeyCodes.indexOf(keyCode) !== -1) {
          event.preventDefault();

          scope.$apply(function () {
            selectInputCtrl.toggleMenu();
          });
        } else {
          scope.$apply(function () {
            selectInputCtrl.open = false;
            selectInputCtrl.searchAndSetValue(charStr);
          });
        }
      }
    }
  }

  /**
   * @namespace helion.framework.widgets.SelectInputController
   * @memberof helion.framework.widgets
   * @name SelectInputController
   * @constructor
   * @param {object} $scope - the Angular $scope
   * @param {object} $q - the Angular $q service
   * @property {object} $scope - the Angular $scope
   * @property {object} ngModelCtrl - the ng-model controller
   * @property {string} placeholder - the placeholder text
   * @property {string} modelLabel - the selected options's label
   * @property {boolean} open - flag whether menu should be visible
   * @property {object} optionsMap - the input options map
   */
  function SelectInputController($scope, $q) {
    this.$scope = $scope;
    this.$q = $q;
    this.ngModelCtrl = null;
    this.placeholder = this.placeholder || 'Select';
    this.open = false;
    this.modelLabel = null;
    this.init();
  }

  angular.extend(SelectInputController.prototype, {
    /**
     * @function init
     * @memberof helion.framework.widgets.SelectInputController
     * @description initialize the widget
     * @returns {void}
     */
    init: function () {
      var that = this;
      this.$scope.$watch(function () {
        return that.inputOptions.length;
      }, function (length) {
        if (length === 1) {
          that.setValue(that.inputOptions[0]);
        }
      });

      // If input options is rebuilt, we may show an outdated label (viewValue)
      this.$scope.$watch(function () {
        return that.inputOptions;
      }, function (newVal, oldVal) {
        if (newVal === oldVal) {
          return;
        }
        that.ngModelCtrl.$render();
      });
    },

    /**
     * @function searchAndSetValue
     * @memberof helion.framework.widgets.SelectInputController
     * @description Search for option that starts with specified
     * character from key press and set it as the input value.
     * @param {string} searchTerm - the character to search for
     * @returns {void}
     */
    searchAndSetValue: function (searchTerm) {
      if (searchTerm) {
        var searchRegex = new RegExp('^' + searchTerm, 'i');

        for (var i = 0; i < this.inputOptions.length; i++) {
          var option = this.inputOptions[i];
          if (searchRegex.test(option.label)) {
            if (option.value !== this.ngModelCtrl.$modelValue) {
              this.setValue(option);
              return;
            }
          }
        }
      }
    },

    /**
     * @function setLabel
     * @memberof helion.framework.widgets.SelectInputController
     * @description Set this input field's label
     * @param {object} modelValue - the input field's value
     * @returns {void}
     */
    setLabel: function (modelValue) {
      if (angular.isDefined(modelValue) && modelValue !== null) {
        var initialValue = _.find(this.inputOptions, {value: modelValue});
        this.modelLabel = initialValue ? initialValue.label : null;
      } else {
        this.modelLabel = null;
      }
    },

    /**
     * @function setValue
     * @memberof helion.framework.widgets.SelectInputController
     * @description Set this input field's selected value
     * @param {object} option - the option object (label and value)
     * @returns {void}
     */
    setValue: function (option) {
      if (!option.disabled) {
        this.ngModelCtrl.$setViewValue(option.value);
        this.ngModelCtrl.$render();
      }
    },

    /**
     * @function toggleMenu
     * @memberof helion.framework.widgets.SelectInputController
     * @description Toggle the menu
     * @returns {void}
     */
    toggleMenu: function () {
      this.open = !this.open;
    },

    /**
     * @function refreshActionWrapper
     * @memberof helion.framework.widgets.SelectInputController
     * @description Wrapper around the refresh action to manage the spinner and intercept the click event
     * @param {object} $event - click event
     * @returns {boolean} true
     * */
    refreshActionWrapper: function ($event) {
      var that = this;
      $event.stopPropagation();

      if (that.refreshing) {
        return true;
      }

      that.refreshing = true;
      that.$q.when(this.refreshAction.execute()).finally(function () {
        that.refreshing = false;
      });
      return true;
    }

  });

})();
