(function () {
  'use strict';

  var _ = require('../../../../tools/node_modules/lodash');
  var helpers = require('../helpers.po');

  module.exports = {
    wrap: wrap,

    getTitle: getTitle,

    getSteps: getSteps,
    getStepNames: getStepNames,
    getCurrentStep: getCurrentStep,

    getCancel: getCancel,
    getBack: getBack,
    getNext: getNext,

    isCancelEnabled: isCancelEnabled,
    isNextEnabled: isNextEnabled,
    isErrored: isErrored,

    cancel: cancel,
    next: next
  };

  function wrap(element) {
    return {
      getTitle: _.partial(getTitle, element),

      getSteps: _.partial(getSteps, element),
      getStepNames: _.partial(getStepNames, element),
      getCurrentStep: _.partial(getCurrentStep, element),

      getCancel: _.partial(getCancel, element),
      getBack: _.partial(getBack, element),
      getNext: _.partial(getNext, element),

      isCancelEnabled: _.partial(isCancelEnabled, element),
      isNextEnabled: _.partial(isNextEnabled, element),
      isErrored: _.partial(isErrored, element),

      cancel: _.partial(cancel, element),
      next: _.partial(next, element)
    };
  }

  function getTitle(ele) {
    return ele.element(by.css('.wizard-head h4')).getText();
  }

  function getSteps(ele) {
    return ele.all(by.css('.wizard-nav-item'));
  }

  function getStepNames(element) {
    return getSteps(element).then(function (steps) {
      var promises = [];
      _.forEach(steps, function (step) {
        promises.push(step.getText());
      });
      return Promise.all(promises);
    });
  }

  function getCurrentStep(ele) {
    return ele.element(by.css('.wizard-nav-item.nav-item.active'));
  }

  function getCancel(ele) {
    return ele.element(by.css('.wizard-foot .btn.cancel'));
  }

  function getBack(ele) {
    return ele.element(by.css('.wizard-foot .btn.back'));
  }

  function getNext(ele) {
    return ele.element(by.css('.wizard-foot .btn.next'));
  }

  function isCancelEnabled(element) {
    return _buttonEnabled(getCancel(element));
  }

  function isNextEnabled(element) {
    return _buttonEnabled(getNext(element));
  }

  function isErrored(ele) {
    return ele.element(by.css('.alert-danger')).isPresent();
  }

  function cancel(element) {
    return getCancel(element).click();
  }

  function next(element) {
    return getNext(element).click();
  }

  function _buttonEnabled(element) {
    return helpers.isButtonEnabled(element);
  }
})();
