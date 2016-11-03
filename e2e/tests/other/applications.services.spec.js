'use strict';

var helpers = require('../../po/helpers.po');
var resetTo = require('../../po/resets.po');
var loginPage = require('../../po/login-page.po');
var galleryPage = require('../../po/applications/applications.po');
var applicationPage = require('../../po/applications/application.po');

xdescribe('Application - Services', function () {
  beforeAll(function () {
    browser.driver.wait(resetTo.devWorkflow(false))
      .then(function () {
        helpers.setBrowserNormal();
        helpers.loadApp();
        loginPage.login('dev', 'dev');
        galleryPage.showApplications();
        galleryPage.showApplicationDetails(0);
        applicationPage.showServices();
      });
  });

  it('should show application services URL', function () {
    expect(browser.getCurrentUrl()).toMatch(/services$/);
  });

  it('should show render multiple service panels', function () {
    expect(galleryPage.servicePanelsAddServiceButtons().count()).toBeGreaterThan(0);
  });

  describe('and you click on "Add Service"', function () {
    beforeAll(function () {
      galleryPage.showServiceDetails(0);
    });

    it('shows the service preview panel', function () {
      expect(galleryPage.applicationServiceFlyout().isDisplayed()).toBe(true);
    });
  });
});
