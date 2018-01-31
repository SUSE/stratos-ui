import { Injectable } from '@angular/core';

export interface ApplicationStateData {
  label: string;
  indicator: string;
  actions: {
    [key: string]: boolean
  };
}

@Injectable()
export class ApplicationStateService {

  /**
 * @description: State metadata
 *
 * First level keys match the APP_STATE with a '?' for a wildcard match for any APP_STATE
 * Second level keys match PACKAGE_STATE directly OR on a combination of #running #crashed, #flapping
 * which we presentation in the name as (X,X,X) - where X can be:
 *   - 0 - must be 0
 *   - N - must be >0
 *   - ? - matches when the value is not known
 *
 * To determine the incomplete state, we also need to look at the package_updated_at field
 *
 */
  private stateMetadata = {
    '?': {
      FAILED: {
        label: 'Staging Failed',
        indicator: 'error',
        actions: 'delete'
      }
    },
    PENDING: {
      '?': {
        label: 'Pending',
        indicator: 'busy',
        actions: 'delete'
      }
    },
    LOADING: {
      '?': {
        label: 'Loading',
        indicator: 'busy'
      }
    },
    STOPPED: {
      PENDING: {
        label: 'Offline while Updating',
        indicator: 'warning',
        actions: 'delete'
      },
      STAGED: {
        label: 'Offline',
        indicator: 'warning',
        actions: 'start,delete,cli'
      },
      '*NONE*': {
        label: 'Incomplete',
        indicator: 'incomplete',
        actions: 'delete,cli'
      }
    },
    STARTED: {
      NO_INSTANCES: {
        label: 'Deployed',
        subLabel: 'No Instances',
        indicator: 'ok',
        actions: 'stop,restart,cli'
      },
      PENDING: {
        label: 'Staging App',
        indicator: 'busy',
        actions: 'delete'
      },
      'STAGED(?,?,?)': {
        label: 'Deployed',
        indicator: 'tentative',
        actions: 'stop,restart,cli'
      },
      'STAGED(0,0,0)': {
        label: 'Deployed',
        subLabel: 'Starting App',
        indicator: 'busy',
        actions: 'stop,restart,cli'
      },
      'STAGED(N,0,0,N)': {
        label: 'Deployed',
        subLabel: 'Starting App',
        indicator: 'busy',
        actions: 'stop,restart,cli'
      },
      'STAGED(N,0,0)': {
        label: 'Deployed',
        subLabel: 'Online',
        indicator: 'ok',
        actions: 'stop,restart,launch,cli'
      },
      'STAGED(0,N,0)': {
        label: 'Deployed',
        subLabel: 'Crashed',
        indicator: 'error',
        actions: 'stop,restart,cli'
      },
      'STAGED(0,0,N)': {
        label: 'Deployed',
        subLabel: 'Starting App',
        indicator: 'warning',
        actions: 'stop,restart,cli'
      },
      'STAGED(0,N,N)': {
        label: 'Deployed',
        subLabel: 'Crashing',
        indicator: 'error',
        actions: 'stop,restart,cli'
      },
      'STAGED(N,N,0)': {
        label: 'Deployed',
        subLabel: 'Partially Online',
        indicator: 'warning',
        actions: 'stop,restart,launch,cli'
      },
      'STAGED(N,0,N)': {
        label: 'Deployed',
        subLabel: 'Partially Online',
        indicator: 'warning',
        actions: 'stop,restart,launch,cli'
      }
    }
  };

  /**
 * @description Translates string list of action names into a map for easier checking if an action is supported
 * @param {any} obj - object to traverse to replace 'actions' keys with maps
 */
  private mapActions(obj: any) {
    for (const k of Object.keys(obj)) {
      const v = obj[k];
      if (k === 'actions') {
        const map = {};
        v.split(',').forEach(a => {
          map[a.trim()] = true;
        });
        obj.actions = map;
      } else if (typeof(v) === 'object') {
        this.mapActions(v);
      }
    }
  }

  constructor() {
    this.mapActions(this.stateMetadata);
  }

  actionIsAvailable(applicationState: string, action: string) {

  }

  /**
* @description Get the application state metadata for an application based on its summary and
* optionally its instance metadata.
* @param {object} summary - the application summary metadata (either from summary or entity)
* @param {object} appInstances - the application instances metadata (from the app stats API call)
*/
  get(summary: any, appInstances: any): ApplicationStateData {
    const appState: string = summary ? summary.state : 'UNKNOWN';
    const pkgState = this.getPackageState(appState, summary);
    const wildcard = this.stateMetadata['?'];

    // App state wildcard match, just match on package state
    if (wildcard && wildcard[pkgState]) {
      return wildcard[pkgState];
    }

    const appStateMatch = this.stateMetadata[appState];
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

          let extState;
          // Do the best we can if we do not have app instance metadata
          if (appInstances) {
            const counts = this.getCounts(summary, appInstances);

            // Special case: App instances only in running and starting state
            if (counts.starting > 0 && counts.okay === summary.instances) {
              extState = pkgState + '(N,0,0,N)';
            } else {
              extState = pkgState + '(' +
                this.formatCount(counts.running) + ',' +
                this.formatCount(counts.crashed) + ',' +
                this.formatCount(counts.flapping) + ')';
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
      label: 'Unknown',
      indicator: 'error',
      actions: null
    };
  }


  /**
 * @description Gets the package state based on the application summary metadata
 * @param {string} appState - the application state
 * @param {object} summary - the application summary
 */
  private getPackageState(appState: string, summary: any): string {
    let pkgState = (summary ? summary.package_state : '') || '*NONE*';
    // Tweak package state based on extra info in package_updated_at if needed (for now, only if stopped)
    if (appState === 'STOPPED' && pkgState === 'PENDING') {
      pkgState = summary.package_updated_at && summary.package_updated_at.length > 0 ? 'PENDING' : '*NONE*';
    }
    return pkgState;
  }

  /**
 * @description Get an object with the instance counts for running, crashed and failing
 * @param {object} summary - the application summary
 * @param {object} appInstances - the application instances metadata (from the app stats API call)
 * @returns {object} Object with instance count metadata
 */
  private getCounts(summary, appInstances) {
    const counts: any = {};
    // Need to check based on additional state
    // Note that the app summary returned when we are getting all apps does not report running_instances
    // NOTE: running_instances does not mean that the instance states ar "RUNNING"
    counts.running = this.getCount(undefined, appInstances, 'RUNNING');
    counts.starting = this.getCount(undefined, appInstances, 'STARTING');
    counts.okay = counts.running + counts.starting;

    // If we know how many aer running and this is the same as the total # instances then
    // this implies that #crashed and #flapping are 0, so we can skip needing to use app instance metadata
    if (counts.running === summary.instances) {
      counts.crashed = 0;
      counts.flapping = 0;
    } else {
      counts.crashed = this.getCount(undefined, appInstances, 'CRASHED');
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
* @description Get a count either from a value if supplied or by filterine app instance metadata
* @param {number} value - the value to use directly or undefined if not available
* @param {object} appInstances - the application instances metadata (from the app stats API call)
* @param {string} instanceState - the instance state to use when filtering the app instance metadata
*/
  private getCount(value: number, appInstances: any, instanceState: string): number {
    // Use a value if one available
    if (value) {
      return value;
    } else if (appInstances) {
      // Calculate from app instance metadata if available
      return (Object.keys(appInstances).filter(k => appInstances[k].state === instanceState)).length;
    } else {
      // No value given and no instance data available, so return -1 to represent unknown
      return -1;
    }
  }

  /**
 * @description Format a numeric count into a string to be used for state matching
 * @param {number} value - the value to use directly or undefined if not available
 */
  private formatCount(value: number): string {
    if (value === 0) {
      return '0';
    } else if (value > 0) {
      return 'N';
    } else {
      return '?';
    }
  }

  /**
  * @description Get the instance state - single state to summarize the state of the application's instances
  * @param {object} summary - the application summary metadata (either from summary or entity)
  * @param {object} appInstances - the application instances metadata (from the app stats API call)
  */
  getInstanceState(summary: any, appInstances: any): ApplicationStateData {
    const appState: string = summary ? summary.state : 'UNKNOWN';
    if (appState !== 'STARTED') {
      return this.getStateForIndicator('tentative');
    } else {
      const running = this.getCount(undefined, appInstances, 'RUNNING');
      if (running === summary.instances) {
        return this.getStateForIndicator('ok');
      } else if (running > 0) {
        return this.getStateForIndicator('warning');
      }

      return this.getStateForIndicator('error');
    }
  }

  private getStateForIndicator(indicator: string): ApplicationStateData {
    return {
      indicator: indicator,
      label: '-',
      actions: {}
    };
  }

}
