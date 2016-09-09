(function () {
  'use strict';

  /**
   * @namespace app.model.navigation
   * @memberOf app.model
   * @name navigation
   * @description Navigation model
   */
  angular
    .module('app.model')
    .run(registerModel);

  registerModel.$inject = [
    'app.model.modelManager',
    'app.event.eventService',
    '$state',
    '$rootScope',
    '$log'
  ];

  function registerModel(modelManager, eventService, $state, $rootScope, $log) {
    /**
     * Register 'app.model.navigation' with the model manager service.
     * This model hosts the application's navigation tree.
     */
    modelManager.register('app.model.navigation', new NavigationModel(eventService, $state, $rootScope, $log));
  }

  /**
   * @namespace app.model.NavigationModel
   * @memberof app.model
   * @name NavigationModel
   * @constructor
   * @param {app.event.eventService} eventService - the event bus service
   * @param {object} $state - ui-router $state service
   * @param {object} $rootScope - Angular rootScope object
   * @param {object} $log - angular log service
   * @property {app.event.eventService} eventService - the event bus service
   * @property {object} $state - ui-router $state service
   * @property {app.model.navigation} menu - the navigation model
   */
  function NavigationModel(eventService, $state, $rootScope, $log) {
    var that = this;
    this.eventService = eventService;
    this.$state = $state;
    this.menu = new Menu($log);
    this.eventService.$on(this.eventService.events.LOGIN, function () {
      that.onLogin();
    });
    this.eventService.$on(this.eventService.events.LOGOUT, function () {
      that.onLogout();
    });
    this.eventService.$on(this.eventService.events.REDIRECT, function (event, state) {
      that.onAutoNav(event, state);
    });
    this.eventService.$on(this.eventService.events.TRANSFER, function (event, state, params) {
      that.$state.go(state, params, {location: false});
    });

    // Install a global state change handler
    // The rootScope never gets destroyed so we can safely ignore the eslint error
    $rootScope.$on('$stateChangeSuccess', function (event, toState) { // eslint-disable-line angular/on-watch
      // Activate the correct menu entry or deactivate all menu entries if none match
      that.menu.currentState = _.get(toState, 'data.activeMenuState', '');
      // Scroll to the console-view's top after a state transition
      var consoleViewScrollPanel = angular.element(document).find('#console-view-scroll-panel');
      if (consoleViewScrollPanel[0]) {
        consoleViewScrollPanel[0].scrollTop = 0;
      }
    });
  }

  angular.extend(NavigationModel.prototype, {
    /**
     * @function onLogin
     * @memberof app.model.NavigationModel
     * @description login event handler
     * @private
     */
    onLogin: function () {
      this.menu.reset();
    },

    /**
     * @function onLogout
     * @memberof app.model.NavigationModel
     * @description logout event handler
     * @private
     */
    onLogout: function () {
      this.menu.reset();
    },

    /**
     * @function onAutoNav
     * @memberof app.model.NavigationModel
     * @description automatic navigating event handler
     * @param {object} event - angular event object
     * @param {string} state - the state to navigate to
     * @private
     */
    onAutoNav: function (event, state) {
      this.$state.go(state);
    }
  });

  /**
   * @namespace app.model.navigation.Menu
   * @memberof app.model.navigation
   * @name app.model.navigation.Menu
   * @param {object} $log - angular log service
   * @property {string} currentState - current ui-router state
   */
  function Menu($log) {
    this.currentState = null;
    this.$log = $log;
  }

  // Using an array as the prototype
  Menu.prototype = [];

  angular.extend(Menu.prototype, {
    /**
     * @function addMenuItem
     * @memberof app.model.navigation.Menu
     * @description Appends a new menu item into the menu list. Each menu item
     * is a sub-menu which is also of type Menu and is empty initially.
     * @param {string} name - the name/ID of the menu item
     * @param {string} href - the href / ng-router state we go to when clicking the entry.
     *                        e.g. cf.applications.list.gallery-view
     * @param {string} text - the displayed text of the menu item
     * @param {number=} pos - optional position in the menu to insert at
     * @param {string=} icon - the icon of the menu item
     * @param {string=} baseState - optional href / ng-router top-level base state e.g. cf.applications or cf.workspaces
     *                              (defaults to name)
     * @returns {app.model.navigation.Menu} The navigation's Menu object
     */
    addMenuItem: function (name, href, text, pos, icon, baseState) {
      var item = {
        name: name,
        href: href,
        text: text,
        icon: icon,
        // baseState is used to work out which menu entry is active based on any child state
        baseState: baseState || name, // defaults to name
        items: new Menu()   // sub-menu
      };
      if (angular.isNumber(pos)) {
        // Fill in the array to have the required number of items
        // This allows out of order addMenuItem calls to work as expected
        while (this.length <= pos) {
          this.push(null);
        }
        if (this[pos] !== null) {
          this.$log.error('addMenuItem: items named ' + "'" + item.name + "' and '" + this[pos].name +
            "' have the same position '" + pos + "'");
        }
        this.splice(pos, 1, item);
      } else {
        this.push(item);
      }

      return this;
    },

    /**
     * @function reset
     * @memberof app.model.navigation.Menu
     * @description Clear the menu list
     * @returns {app.model.navigation.Menu} The navigation's Menu object
     */
    reset: function () {
      this.length = 0;
      return this;
    }
  });

})();
