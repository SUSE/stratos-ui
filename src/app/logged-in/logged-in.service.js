(function () {
  'use strict';

  angular
    .module('app.logged-in')
    .factory('appLoggedInLoggedInService', loggedInServiceFactory);

  /**
   * @namespace app.loggedIn.appLoggedInLoggedInService
   * @memberof app.loggedIn
   * @name loggedInServiceFactory
   * @param {object} appEventEventService - Event Service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {object} frameworkWidgetsDialogConfirm - the confirmation dialog service
   * @param {object} $interval - the angular $interval Service
   * @param {object} $interpolate - the angular $interpolate Service
   * @param {object} $rootScope - the angular $rootScope Service
   * @param {object} $window - the angular $window Service
   * @param {object} $log - the angular $log Service
   * @param {object} $document - the angular $document Service
   * @returns {object} Logged In Service
   */
  function loggedInServiceFactory(appEventEventService, modelManager, frameworkWidgetsDialogConfirm,
                                  $interval, $interpolate, $rootScope, $window, $log, $document) {

    var loggedIn = false;
    var lastUserInteraction = moment();
    var sessionChecker, dialog;

    // Check the session every 30 seconds (Note: this is vey cheap to do unless the session is about to expire)
    var checkSessionInterval = 30 * 1000;

    // Warn inactive users 2 minutes before logging them out
    var warnBeforeLogout = 2 * 60 * 1000;

    // User considered idle if no interaction for 5 minutes
    var userIdlePeriod = 5 * 60 * 1000;

    // Avoid a race condition where the cookie is deleted if the user presses ok just before expiration
    var autoLogoutDelta = 5 * 1000;

    // When we see the following events, we consider the user as active
    var userActiveEvents = 'keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll';

    var activityPromptShown = false;

    function logout() {
      $log.debug('Logging out');
      return _getAccountModel().logout().finally(function () {
        $log.debug('Reloading page');
        $window.location = '/';
      });
    }

    function promptInactiveUser(expiryDate) {
      var scope = $rootScope.$new();
      scope.moment = moment;

      var skipDigest = false;
      var digestInterval = $interval(function () {}, 1000);
      activityPromptShown = true;

      scope.getExpiryDuration = function () {
        if (skipDigest) {
          return '';
        }
        var delta = expiryDate.diff(moment());
        if (delta < 0) {
          delta = 0;
          skipDigest = true; // prevent further digests while we logout and reload
          dialog.dismiss();
          logout();
        }
        return moment.duration(delta).format('m[m] s[s]');
      };

      dialog = frameworkWidgetsDialogConfirm({
        title: gettext('Are you still there?'),
        description: function () {
          return $interpolate(gettext('You have been inactive for a while. For your protection, ' +
              'we will automatically log you out in {{ getExpiryDuration() }}'))(scope);
        },
        moment: moment,
        hideNo: true,
        buttonText: {
          yes: gettext('I am still here')
        }
      });
      dialog.result
        .then(function () {
          $log.debug('User is still here! Automatically refresh session');
          return _getAccountModel().verifySession().catch(function (error) {
            // If we fail to refresh, logout!
            $log.error('Failed to refreshed Session!', error);
            logout();
          });
        })
        .finally(function () {
          $interval.cancel(digestInterval);
          activityPromptShown = false;
        });
    }

    function checkSession() {
      if (activityPromptShown) {
        return;
      }
      var now = moment();
      var sessionExpiresOn = _getAccountModel().getAccountData().sessionExpiresOn;
      var safeExpire = moment(sessionExpiresOn).subtract(moment.duration(autoLogoutDelta));
      var delta = safeExpire.diff(now);
      var aboutToExpire = delta < warnBeforeLogout;

      if (aboutToExpire) {
        var idleDelta = now.diff(lastUserInteraction);
        var userIsActive = idleDelta < userIdlePeriod;
        if (userIsActive) {
          _getAccountModel().verifySession().catch(function (error) {
            // If we fail to refresh, logout!
            $log.error('Failed to refreshed Session!', error);
            logout();
          });
        } else {
          promptInactiveUser(safeExpire);
        }
      }
    }

    $document.find('html').on(userActiveEvents, function () {
      userInteracted();
    });

    appEventEventService.$on(appEventEventService.events.LOGIN, function () {
      loggedIn = true;
      sessionChecker = $interval(checkSession, checkSessionInterval);
    });

    appEventEventService.$on(appEventEventService.events.LOGOUT, function () {
      loggedIn = false;
      if (angular.isDefined(sessionChecker)) {
        $interval.cancel(sessionChecker);
        sessionChecker = undefined;
      }
    });

    return {
      isLoggedIn: isLoggedIn,
      userInteracted: userInteracted
    };

    function isLoggedIn() {
      return loggedIn;
    }

    function userInteracted() {
      lastUserInteraction = moment();
    }

    function _getAccountModel() {
      return modelManager.retrieve('app.model.account');
    }

  }

})();
