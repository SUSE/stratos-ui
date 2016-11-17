(function () {
  'use strict';

  // Navbar helpers
  module.exports = {

    goToView: goToView,

    showAccountSettings: showAccountSettings,
    logout: logout

  };

  function goToView(viewName) {
    var id = 'navbar-item-' + viewName.toLowerCase();
    return element(by.css('navigation'))
      .element(by.id(id))
      .click();
  }

  function showAccountSettings() {
    return goToView('account-settings');
  }

  function logout() {
    return goToView('logout').then(function () {
      browser.driver.sleep(100);
    });
  }
})();
