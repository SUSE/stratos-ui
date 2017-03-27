(function () {
  'use strict';

  angular
    .module('app.view')
    .directive('application', application);

  application.$inject = [
    'app.basePath'
  ];

  /**
   * @namespace app.view.application
   * @memberof app.view
   * @name application
   * @param {string} path - the application base path
   * @property {app.view.application.ApplicationController} controller - the application controller
   * @property {string} controllerAs - the application controller identifier
   * @property {string} templateUrl - the application template filepath
   * @returns {object} The application directive definition object
   */
  function application(path) {
    return {
      controller: ApplicationController,
      controllerAs: 'applicationCtrl',
      templateUrl: path + 'view/application.html'
    };
  }

  ApplicationController.$inject = [
    'app.event.eventService',
    'modelManager',
    'app.basePath',
    'app.view.upgradeCheck',
    'app.logged-in.loggedInService',
    'app.view.localStorage',
    '$timeout',
    '$state',
    '$stateParams',
    '$window',
    '$rootScope',
    '$scope'
  ];

  /**
   * @namespace app.view.application.ApplicationController
   * @memberof app.view.application
   * @name ApplicationController
   * @param {app.event.eventService} eventService - the event bus service
   * @param {app.model.modelManager} modelManager - the application model manager
   * @param {app.basePath} path - the base path serving our app (i.e. /app)
   * @param {app.view.upgradeCheck} upgradeCheck - the upgrade check service
   * @param {object} loggedInService - the Logged In Service
   * @param {object} localStorage - the Local Storage In Service
   * @param {object} $timeout - Angular $timeout service
   * @param {$state} $state - Angular ui-router $state service
   * @param {$stateParams} $stateParams - Angular ui-router $stateParams service
   * @param {$window} $window - Angular $window service
   * @param {$rootScope} $rootScope - Angular $rootScope service
   * @param {$scope} $scope - Angular $scope service
   * @property {app.event.eventService} eventService - the event bus service
   * @property {app.model.modelManager} modelManager - the application model manager
   * @property {app.basePath} path - the base path serving our app (i.e. /app)
   * @property {app.view.upgradeCheck} upgradeCheck - the upgrade check service
   * @property {object} loggedInService - the Logged In Service
   * @property {$state} $state - Angular ui-router $state service
   * @property {$window} $window - Angular $window service
   * @property {boolean} loggedIn - a flag indicating if user logged in
   * @property {boolean} failedLogin - a flag indicating if user login failed due to bad credentials.
   * @property {boolean} serverErrorOnLogin - a flag indicating if user login failed because of a server error.
   * @class
   */
  function ApplicationController(eventService, modelManager, path, upgradeCheck, loggedInService, localStorage,
                                 $timeout, $state, $stateParams, $window, $rootScope, $scope) {
    var that = this;

    this.eventService = eventService;
    this.modelManager = modelManager;
    this.path = path;
    this.upgradeCheck = upgradeCheck;
    this.loggedInService = loggedInService;

    this.$state = $state;
    this.$window = $window;

    this.loggedIn = false;
    this.failedLogin = false;
    this.serverErrorOnLogin = false;
    this.serverFailedToRespond = false;
    this.showGlobalSpinner = false;
    this.ready = false;

    $timeout(function () {
      that.verifySessionOrCheckUpgrade();
    }, 0);

    // Navigation options
    this.hideNavigation = $stateParams.hideNavigation;
    this.hideAccount = $stateParams.hideAccount;
    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {  // eslint-disable-line angular/on-watch
      that.hideNavigation = toParams.hideNavigation;
      that.hideAccount = toParams.hideAccount;
    });

    // Read back and persist the state of the navigation bar to local storage
    this.navbarIconsOnly = localStorage.getItem('navbarIconsOnly', 'false') === 'true';
    $scope.$watch(function () {
      return that.navbarIconsOnly;
    }, function (nv, ov) {
      if (nv !== ov) {
        localStorage.setItem('navbarIconsOnly', nv);
      }
    });
  }

  angular.extend(ApplicationController.prototype, {
    /**
     * @function verifySession
     * @memberof app.view.application.ApplicationController
     * @description verify session
     * @returns {object} Promise object for session verification
     * @public
     */
    verifySession: function () {
      var that = this;
      return this.modelManager.retrieve('app.model.account')
        .verifySession()
        .then(function () {
          that.onLoggedIn();
        });
    },

    /**
     * @function verifySessionOrCheckUpgrade
     * @memberof app.view.application.ApplicationController
     * @description Verify session or use version endpoint to check if an upgrade is in progress
     * @public
     */
    verifySessionOrCheckUpgrade: function () {
      var that = this;
      this.verifySession().catch(function (response) {
        // We only care about 503 - use upgrade service to determine if this is an upgrade
        if (that.upgradeCheck.isUpgrading(response)) {
          // Upgrade service will cause the upgrade page to be displayed to the user
          that.upgradeCheck.responseError(response);
          // Need to pretend that we are logged in to hide the login page and show the upgrade page
          that.loggedIn = true;
        }
      }).finally(function () {
        that.ready = true;
      });
    },

    /**
     * @function login
     * @memberof app.view.application.ApplicationController
     * @description Log in to the application
     * @param {string} username - the username
     * @param {string} password - the password
     * @public
     */
    login: function (username, password) {
      this.serverFailedToRespond = false;
      this.serverErrorOnLogin = false;
      this.failedLogin = false;

      var that = this;
      this.modelManager.retrieve('app.model.account')
        .login(username, password)
        .then(
          function () {
            that.onLoggedIn();
          },
          function (response) {
            that.onLoginFailed(response);
          }
        );
    },

    /**
     * @function onLoggedIn
     * @memberof app.view.application.ApplicationController
     * @description Logged-in event handler
     * @emits LOGIN
     * @private
     */
    onLoggedIn: function () {
      var that = this;
      this.loggedIn = true;
      this.failedLogin = false;
      this.serverErrorOnLogin = false;
      this.serverFailedToRespond = false;
      this.showGlobalSpinner = true;

      // If we have a setup error, then we don't want to continue login to some other page
      // We will redirect to our error page instead
      this.continueLogin = true;

      // State that we should go to
      this.redirectState = false;

      /**
       * Show cluster registration if user is ITOps (hdp3.admin).
       * Otherwise, show service instance registration as a
       * developer if unregistered.
       */
      var account = this.modelManager.retrieve('app.model.account');

      // Fetch the list of services instances
      /* eslint-disable */
      // TODO: If this fails, we should show a notification message
      /* eslint-enable */
      this.modelManager.retrieve('app.model.serviceInstance')
        .list()
        .then(function onSuccess(data) {
          var noHCFInstances = data.numAvailable === 0;
          // Admin
          if (account.isAdmin()) {
            // Go the endpoints dashboard if there are no HCF clusters
            if (noHCFInstances) {
              that.redirectState = 'endpoint.dashboard';
            }
          } else {
            // Developer
            if (noHCFInstances) {
              // No HCF instances, so the system is not setup and the user can't fix this
              that.continueLogin = false;
              that.eventService.$emit(that.eventService.events.TRANSFER, 'error-page', {error: 'notSetup'});
            } else {
              var userServiceInstanceModel = that.modelManager.retrieve('app.model.serviceInstance.user');
              // Need to get the user's service list to determine if they have any connected
              return userServiceInstanceModel.list().then(function () {
                // Developer - allow user to connect services, if we have some and none are connected
                if (userServiceInstanceModel.numValid === 0) {
                  that.redirectState = 'endpoint.dashboard';
                }
              });
            }
          }
        })
        .then(function () {
          // Update stackatoInfo
          return that.modelManager.retrieve('app.model.stackatoInfo').getStackatoInfo();
        })
        .then(function () {
          // Get the user registered services once at login - only refreshed in endpoints dashboard
          var userServiceInstanceModel = that.modelManager.retrieve('app.model.serviceInstance.user');
          return userServiceInstanceModel.list();
        })
        .finally(function () {
          that.showGlobalSpinner = false;
          if (that.continueLogin) {
            // When we notify listeners that login has completed, in some cases we don't want them
            // to redirect tp their page - we might want to control that the go to the endpoints dahsboard (for exmample).
            // So, we pass this flag to tell them login happenned, but that they should not redirect
            that.eventService.$emit(that.eventService.events.LOGIN, !!that.redirectState);
            // We need to dpo this after the login events are handled, so that ui-router states we might go to are registered
            if (that.redirectState) {
              that.eventService.$emit(that.eventService.events.REDIRECT, that.redirectState);
            }
          }
        });
    },

    /**
     * @function onLoginFailed
     * @memberof app.view.application.ApplicationController
     * @description Login-failure event handler
     * @param {object} response - the HTTP response
     * @emits LOGIN_FAILED
     * @emits HTTP_5XX_ON_LOGIN
     * @private
     */
    onLoginFailed: function (response) {
      if (response.status === -1) {
        // handle the case when the server never responds
        this.eventService.$emit(this.eventService.events.LOGIN_TIMEOUT);
        this.serverFailedToRespond = true;
        this.serverErrorOnLogin = false;
        this.failedLogin = false;
      } else if (response.status >= 500 && response.status < 600) {
        // Check for upgrade - the upgrade handler will show the error - but we need to hide the login panel
        if (this.upgradeCheck.isUpgrading(response)) {
          this.loggedIn = true;
          return;
        }

        // handle 5xx errors when attempting to login
        this.eventService.$emit(this.eventService.events.HTTP_5XX_ON_LOGIN);
        this.serverFailedToRespond = false;
        this.serverErrorOnLogin = true;
        this.failedLogin = false;
      } else {
        // general authentication failed
        this.eventService.$emit(this.eventService.events.LOGIN_FAILED);
        this.serverFailedToRespond = false;
        this.serverErrorOnLogin = false;
        this.failedLogin = true;
      }
      this.loggedIn = false;
    },

    /**
     * @function logout
     * @memberof app.view.application.ApplicationController
     * @description Log out of the application
     * @public
     */
    logout: function () {
      var that = this;
      this.showGlobalSpinner = true;
      this.modelManager.retrieve('app.model.account')
        .logout()
        .then(function () {
          // no point calling this as we are going to reload the app
          //that.onLoggedOut();

          that.reload();
        });
    },

    /**
     * @function reload
     * @memberof app.view.application.ApplicationController
     * @description Reload the application
     * @public
     */
    reload: function () {
      /* eslint-disable no-warning-comments */
      // FIXME: Can we clean the model and all current state instead? (reload the app for now)
      /* eslint-enable no-warning-comments */
      // Hard reload of the app in the browser ensures all state is cleared
      this.$window.location = '/';
    },

    /**
     * @function onLoggedOut
     * @memberof app.view.application.ApplicationController
     * @description Logged-out event handler
     * @emits LOGOUT
     * @private
     */
    onLoggedOut: function () {
      this.eventService.$emit(this.eventService.events.LOGOUT);
      this.loggedIn = false;
    }
  });

})();
