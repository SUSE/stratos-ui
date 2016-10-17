'use strict';

var navbar = require('./navbar.po');
var helpers = require('./helpers.po');

module.exports = {

  applicationGalleryCards: applicationGalleryCards,
  applicationGalleryCard: applicationGalleryCard,

  showApplications: showApplications,
  showApplicationDetails: showApplicationDetails,
  showServices: showServices,
  showDeliveryLogs: showDeliveryLogs,

  isApplicationWall: isApplicationWall,
  isApplicationWallNoClusters: isApplicationWallNoClusters
  // ,
  // applicationServiceFlyout: applicationServiceFlyout,
  // showServiceDetails: showServiceDetails,
  // serviceAddConfirm: serviceAddConfirm,
  // servicePanelsAddServiceButtons: servicePanelsAddServiceButtons

};

function applicationGalleryCard(idx) {
  return applicationGalleryCards().get(idx)
    .element(by.css('gallery-card'));
}

function applicationGalleryCards() {
  return element.all(by.css('application-gallery-card'));
}

function showApplications() {
  navbar.goToView('Applications');
}

function showApplicationDetails(idx) {
  applicationGalleryCard(idx).click();
}

function showServices() {
  applicationAction(2).click();
}

function showDeliveryLogs() {
  applicationAction(3).click();
}

function applicationActionsBar() {
  return element.all(by.css('ul.nav.nav-tabs li a'));
}

function applicationAction(idx) {
  return applicationActionsBar().get(idx);
}

function isApplicationWall() {
  return browser.getCurrentUrl().then(function (url) {
    return url === helpers.getHost() + '/#/cf/applications/list/gallery-view';
  });
}

function isApplicationWallNoClusters() {
  return isApplicationWall().then(function () {
    return element(by.css('.applications-empty .applications-msg'));
  });
}

// function servicePanelsAddServiceButtons() {
//   return element.all(by.css('div.service-panel div.service-actions button'));
// }

// function servicePanelsAddServiceButton(idx) {
//   return servicePanelsAddServiceButtons().get(idx);
// }
//
// function serviceDetailsActions() {
//   return element.all(by.css('div.service-detail-actions button'));
// }

// function serviceDetailsAction(idx) {
//   return serviceDetailsActions().get(idx);
// }

// function showServiceDetails() {
//   servicePanelsAddServiceButton(0).click();
//   browser.driver.sleep(1000);
// }

// function serviceDetailsAddAction() {
//   return serviceDetailsAction(1);
// }
//
// function serviceDetailsCancelAction() {
//   return serviceDetailsAction(0);
// }

// function applicationServiceFlyout() {
//   return element(by.css('add-service-workflow'));
// }

// function serviceAddConfirm() {
//   serviceDetailsAddAction().click();
// }
//
// function serviceAddCancel() {
//   serviceDetailsCancelAction().click();
// }
