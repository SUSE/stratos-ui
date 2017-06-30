(function () {
  'use strict';

  /**
   * @namespace cloud-foundry.model.application
   * @memberOf cloud-foundry.model
   */
  angular
    .module('cloud-foundry.model')
    .factory('cfAppStateService', stateServiceFactory);

  /**
   * @function stateServiceFactory
   * @memberof cloud-foundry.model.application
   * @description Service to map app states to user-friendly state names, presentation and actions.
   * @returns {object} The Application State Service
   */
  function stateServiceFactory() {
    /**
     * State metadata
     *
     * First level keys match the APP_STATE with a '?' for a wildcard match for any APP_STATE
     * Second level keys match PACKAGE_STATE directly OR on a combination of #running #crashed, #flapping
     * which we presentation in the name as (X,X,X) - where X can be:
     *   - 0 - must be 0
     *   - N - must be >0
     *   - ? - matches when the value is not known
     *
     * To determine the incompelete state, we also need to look at the package_updated_at field
     *
     */
    var stateMetadata = {
      '?': {
        FAILED: {
          label: 'app.state.failed',
          indicator: 'error',
          actions: 'delete'
        }
      },
      PENDING: {
        '?': {
          label: 'app.state.pending',
          indicator: 'busy',
          actions: 'delete'
        }
      },
      LOADING: {
        '?': {
          label: 'app.state.loading',
          indicator: 'busy'
        }
      },
      STOPPED: {
        PENDING: {
          label: 'app.state.updating',
          indicator: 'warning',
          actions: 'delete'
        },
        STAGED: {
          label: 'app.state.offline',
          indicator: 'warning',
          actions: 'start,delete,cli'
        },
        '*NONE*': {
          label: 'app.state.incomplete',
          indicator: 'warning',
          actions: 'delete, cli'
        }
      },
      STARTED: {
        NO_INSTANCES: {
          label: 'app.state.deployed',
          subLabel: 'app.state.no-instances',
          indicator: 'ok',
          actions: 'stop,restart,cli'
        },
        PENDING: {
          label: 'app.state.staging',
          indicator: 'busy',
          actions: 'delete'
        },
        'STAGED(?,?,?)': {
          label: 'app.state.deployed',
          indicator: 'tentative',
          actions: 'stop,restart,cli'
        },
        'STAGED(0,0,0)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.starting',
          indicator: 'busy',
          actions: 'stop,restart,cli'
        },
        'STAGED(N,0,0,N)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.starting',
          indicator: 'busy',
          actions: 'stop,restart,cli'
        },
        'STAGED(N,0,0)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.online',
          indicator: 'ok',
          actions: 'stop,restart,launch,cli'
        },
        'STAGED(0,N,0)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.crashed',
          indicator: 'error',
          actions: 'stop,restart,cli'
        },
        'STAGED(0,0,N)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.starting',
          indicator: 'warning',
          actions: 'stop,restart,cli'
        },
        'STAGED(0,N,N)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.crashing',
          indicator: 'error',
          actions: 'stop,restart,cli'
        },
        'STAGED(N,N,0)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.partial',
          indicator: 'warning',
          actions: 'stop,restart,launch,cli'
        },
        'STAGED(N,0,N)': {
          label: 'app.state.deployed',
          subLabel: 'app.state.partial',
          indicator: 'warning',
          actions: 'stop,restart,launch,cli'
        }
      }
    };

    /**
     * @function mapActions
     * @description Translates string list of action names into a map for easier checking if an action is supported
     * @param {object} obj - object to traverse to replace 'actions' kets with maps
     */
    function mapActions(obj) {
      _.each(obj, function (v, k) {
        if (angular.isObject(v)) {
          mapActions(v);
        } else if (k === 'actions') {
          var map = {};
          _.each(v.split(','), function (a) { map[a.trim()] = true; });
          obj.actions = map;
        }
      });
    }

    mapActions(stateMetadata);

    // This service supports a single 'get' method
    return {
      get: get
    };

    /**
     * @function get
     * @memberof cloud-foundry.model.application.cfAppStateService
     * @description Get the application state metadata for an application based on its summary and
     * optionally its instance metadata.
     * @param {object} summary - the application summary metadata (either from summary or entity)
     * @param {object} appInstances - the application instances metadata (from the app stats API call)
     * @returns {object} Object representing the state metadata for the application
     */
    function get(summary, appInstances) {
      var appState = summary ? summary.state : 'UNKNOWN';
      var pkgState = getPackageState(appState, summary);
      var wildcard = stateMetadata['?'];

      // App state wildcard match, just match on package state
      if (wildcard && wildcard[pkgState]) {
        return wildcard[pkgState];
      }

      var appStateMatch = stateMetadata[appState];
      if (appStateMatch) {
        if (appStateMatch[pkgState]) {
          return appStateMatch[pkgState];
        } else {
          // Check if we have a wildcard pkg match
          if (appStateMatch['?']) {
            return appStateMatch['?'];
          } else {

            // Special case for when the desired app instance counf is 0
            if (summary && summary.instances === 0) {
              return appStateMatch.NO_INSTANCES;
            }

            var extState;
            // Do the best we can if we do not have app instance metadata
            if (appInstances) {
              var counts = getCounts(summary, appInstances);

              // Special case: App instances only in running and starting state
              if (counts.starting > 0 && counts.okay === summary.instances) {
                extState = pkgState + '(N,0,0,N)';
              } else {
                extState = pkgState + '(' +
                formatCount(counts.running) + ',' +
                formatCount(counts.crashed) + ',' +
                formatCount(counts.flapping) + ')';
              }
            } else {
              extState = pkgState + '(?,?,?)';
            }
            if (appStateMatch[extState]) {
              return appStateMatch[extState];
            }
          }
        }
      }

      // No match against the state table, so return unknown
      return {
        label: 'app.state.unknown',
        indicator: 'error',
        actions: {}
      };
    }

    /**
     * @function getPackageState
     * @memberof cloud-foundry.model.application.cfAppStateService
     * @description Gets the package state based on the application summary metadata
     * @param {string} appState - the application state
     * @param {object} summary - the application summary
     * @returns {string} Package summary state
     */
    function getPackageState(appState, summary) {
      var pkgState = (summary ? summary.package_state : '') || '*NONE*';
      // Tweak package state based on extra info in package_updated_at if needed (for now, only if stopped)
      if (appState === 'STOPPED' && pkgState === 'PENDING') {
        pkgState = summary.package_updated_at && summary.package_updated_at.length > 0 ? 'PENDING' : '*NONE*';
      }
      return pkgState;
    }

    /**
     * @function getCounts
     * @memberof cloud-foundry.model.application.cfAppStateService
     * @description Get an object with the instance counts for running, crashed and failing
     * @param {object} summary - the application summary
     * @param {object} appInstances - the application instances metadata (from the app stats API call)
     * @returns {object} Object with instance count metadata
     */
    function getCounts(summary, appInstances) {
      var counts = {};
      // Need to check based on additional state
      // Note that the app summary returned when we are getting all apps does not report running_instances
      // NOTE: running_instances does not mean that the instance states ar "RUNNING"
      counts.running = getCount(undefined, appInstances, 'RUNNING');
      counts.starting = getCount(undefined, appInstances, 'STARTING');
      counts.okay = counts.running + counts.starting;

      // If we know how many aer running and this is the same as the total # instances then
      // this implies that #crashed and #flapping are 0, so we can skip needing to use app instance metadata
      if (counts.running === summary.instances) {
        counts.crashed = 0;
        counts.flapping = 0;
      } else {
        counts.crashed = getCount(undefined, appInstances, 'CRASHED');
        if (counts.crashed >= 0) {
          counts.flapping = summary.instances - counts.crashed - counts.running;
        } else {
          // If we couldn't determine #crashed, then we can't calculate #flapping
          counts.flapping = -1;
        }
      }
      return counts;
    }

    /**
     * @function getCount
     * @memberof cloud-foundry.model.application.cfAppStateService
     * @description Get a count either from a value if supplied or by filterine app instance metadata
     * @param {number} value - the value to use directly or undefined if not available
     * @param {object} appInstances - the application instances metadata (from the app stats API call)
     * @param {string} instanceState - the instance state to use when filtering the app instance metadata
     * @returns {number} Count of instances in the desired state
     */
    function getCount(value, appInstances, instanceState) {
      // Use a value if one available
      if (angular.isDefined(value)) {
        return value;
      } else if (appInstances) {
        // Calculate form app instance metadata if available
        return _.filter(appInstances, function (s) { return s.state === instanceState; }).length;
      } else {
        // No value given and no instance data available, so return -1 to represent unknown
        return -1;
      }
    }

    /**
     * @function formatCount
     * @memberof cloud-foundry.model.application.cfAppStateService
     * @description Format a numeric count into a string to be used for state matching
     * @param {number} value - the value to use directly or undefined if not available
     * @returns {string} String representation of value for state matching
     */
    function formatCount(value) {
      if (value === 0) {
        return '0';
      } else if (value > 0) {
        return 'N';
      } else {
        return '?';
      }
    }
  }
})();
