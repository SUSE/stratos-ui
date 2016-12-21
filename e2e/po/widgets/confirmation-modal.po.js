(function () {
  'use strict';

  module.exports = {
    isVisible: isVisible,
    cancel: cancel,
    primary: primary,
    commit: commit
  };

  function isVisible() {
    return element(by.css('.modal.confirm-dialog')).isPresent();
  }

  function cancel() {
    return element(by.css('.modal-footer button.btn.btn-default')).click();
  }

  function primary() {
    return element(by.css('.modal-footer button.btn.btn-primary')).click();
  }

  function commit() {
    return element(by.css('.modal-footer button.btn.btn-commit')).click();
  }

})();
