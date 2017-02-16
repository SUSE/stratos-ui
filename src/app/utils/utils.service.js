(function () {
  'use strict';

  angular
    .module('app.utils')
    .factory('app.utils.utilsService', utilsServiceFactory)
    .filter('mbToHumanSize', mbToHumanSizeFilter)
    .filter('sanitizeString', sanitizeStringFilter);

  utilsServiceFactory.$inject = [
    '$q',
    '$timeout',
    '$log',
    '$window'
  ];

  /**
   * @namespace app.utils.utilsService
   * @memberof app.utils
   * @name utilsService
   * @description Various utility functions
   * @param {object} $q - the Angular $q service
   * @param {object} $timeout - the Angular $timeout service
   * @param {object} $log - the Angular $log service
   * @param {object} $window - angular $window service
   * @returns {object} the utils service
   */
  function utilsServiceFactory($q, $timeout, $log, $window) {
    var UNIT_GRABBER = /([0-9.]+)( .*)/;

    /*
     * Expression used to validate URLs in the Endpoint registration form.
     * Expression explanation available from https://gist.github.com/dperini/729294
     * Passes the following criteria: https://mathiasbynens.be/demo/url-regex
     *
     */
    var urlValidationExpression = new RegExp(
      '^' +
      // protocol identifier
      'http(s)?://' +
      // user:pass authentication
      '(?:\\S+(?::\\S*)?@)?' +
      '(?:' +
      // IP address dotted notation octets
      // excludes loopback network 0.0.0.0
      // excludes reserved space >= 224.0.0.0
      // excludes network & broacast addresses
      // (first & last IP address of each class)
      '(?:[1-9]\\d?|1\\d\\d|2[01]\\d|22[0-3])' +
      '(?:\\.(?:1?\\d{1,2}|2[0-4]\\d|25[0-5])){2}' +
      '(?:\\.(?:[1-9]\\d?|1\\d\\d|2[0-4]\\d|25[0-4]))' +
      '|' +
      // host name
      '(?:(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)' +
      // domain name
      '(?:\\.(?:[a-z\\u00a1-\\uffff0-9]-*)*[a-z\\u00a1-\\uffff0-9]+)*' +
      // TLD identifier
      '(?:\\.(?:[a-z\\u00a1-\\uffff]{2,}))' +
      // TLD may end with dot
      '\\.?' +
      ')' +
      // port number
      '(?::\\d{2,5})?' +
      // resource path
      '(?:[/?#]\\S*)?' +
      '$', 'i'
    );

    return {
      chainStateResolve: chainStateResolve,
      getClusterEndpoint: getClusterEndpoint,
      mbToHumanSize: mbToHumanSize,
      retryRequest: retryRequest,
      runInSequence: runInSequence,
      sizeUtilization: sizeUtilization,
      urlValidationExpression: urlValidationExpression,
      extractCloudFoundryError: extractCloudFoundryError,
      extractCodeEngineError: extractCodeEngineError,
      getOemConfiguration: getOemConfiguration,
      getSensibleTime: getSensibleTime,
      timeTickFormatter: timeTickFormatter,
      sanitizeString: sanitizeString
    };

    /**
     * @function retryRequest
     * @memberOf app.utils.utilsService
     * @description Retries promise until max tries reached
     * @param {object} requestPromise - a function returning a promise object
     * @param {number} maxRetries - max retries
     * @param {number} waitTime - wait time between requests
     * @returns {promise} A promise that will be resolved or rejected later
     */
    function retryRequest(requestPromise, maxRetries, waitTime) {
      var deferred = $q.defer();
      var requestsMade = 1;
      maxRetries = maxRetries || 3;

      var timeout = null;
      var request = function () {
        requestPromise().then(function (response) {
          deferred.resolve(response);
        }, function (response) {
          if (requestsMade < maxRetries) {
            requestsMade++;
            if (timeout) {
              $timeout.cancel(timeout);
            }

            timeout = $timeout(function () {
              request();
            }, waitTime || 5000);
          } else {
            deferred.reject(response);
          }
        });
      };

      request();

      return deferred.promise;
    }

    /**
     * @function runInSequence
     * @memberOf app.utils.utilsService
     * @description runs async functions in sequence
     * @param {object} funcStack - a stack containing async functions
     * @param {boolean} asQueue - optional, indicting to treat the funcStack as a queue
     * @returns {promise} a promise that will be resolved or rejected later
     */
    function runInSequence(funcStack, asQueue) {
      if (asQueue) {
        funcStack.reverse();
      }

      return $q(function (resolve, reject) {
        (function _doIt() {
          if (!funcStack.length) {
            resolve();
            return;
          }
          var func = funcStack.pop();
          func().then(_doIt, reject);
        })();
      });
    }

    function precisionIfUseful(size, precision) {
      if (angular.isUndefined(precision)) {
        precision = 1;
      }
      var floored = Math.floor(size);
      var fixed = Number(size.toFixed(precision));
      if (floored === fixed) {
        return floored;
      }
      return fixed;
    }

    function mbToHumanSize(sizeMb) {
      if (angular.isUndefined(sizeMb)) {
        return '';
      }
      if (sizeMb === -1) {
        return '∞';
      }
      if (sizeMb >= 1048576) {
        return precisionIfUseful(sizeMb / 1048576) + ' TB';
      }
      if (sizeMb >= 1024) {
        return precisionIfUseful(sizeMb / 1024) + ' GB';
      }
      return precisionIfUseful(sizeMb) + ' MB';
    }

    function sizeUtilization(sizeMbUsed, sizeMbTotal) {
      var usedMemHuman = this.mbToHumanSize(sizeMbUsed);
      var totalMemHuman = this.mbToHumanSize(sizeMbTotal);

      var usedUnit = UNIT_GRABBER.exec(usedMemHuman);
      var totalUnit = UNIT_GRABBER.exec(totalMemHuman);
      if (usedUnit && totalUnit && usedUnit[2] === totalUnit[2] || usedUnit && usedUnit[1] === '0') {
        usedMemHuman = usedUnit[1];
      }

      return usedMemHuman + ' / ' + totalMemHuman;
    }

    // Wrap val into a promise if it's not one already
    // N.B. compared with using $q.resolve(val) directly,
    // this avoids creating an additional deferred if val was already a promise
    function _wrapPromise(val) {
      if (val && angular.isFunction(val.then)) {
        return val;
      }
      return $q.resolve(val);
    }

    /**
     * Chain promise returning init functions for ensuring in-order Controller initialisation of nested states
     * NB: this uses custom state data to mimick ui-router's resolve functionality.
     * Unfortunately we cannot reliably use ui-router's built-in resolve because of the way we register plugins
     * during the run phase instead of the config phase.
     * @param {string} stateName - the name of the state chaining its initialization
     * @param {Object} $state - The ui-router $state service
     * @param {function} initFunc - The promise returning init function for setting up the current state
     * */
    function chainStateResolve(stateName, $state, initFunc) {
      var aState = $state.get(stateName);
      var promiseStack = _.get($state.current, 'data.initialized');

      var thisPromise;

      var wrappedCatch = function (error) {
        $log.error('Failed to initialise state. This may result in missing or incorrect data.', error);
        return $q.reject(error);
      };

      if (_.isUndefined(promiseStack)) {
        promiseStack = [];
        aState.data.initialized = promiseStack;
      }
      if (promiseStack.length < 1) {
        $log.debug('Promise stack empty, starting chain from state: ' + aState.name);
        thisPromise = _wrapPromise(initFunc()).catch(wrappedCatch);
      } else {
        var previousPromise = promiseStack[promiseStack.length - 1];
        $log.debug('Init promise chain continued from state: ' + previousPromise._state + ' by: ' + aState.name);
        thisPromise = previousPromise.then(function () {
          return _wrapPromise(initFunc()).catch(wrappedCatch);
        });
      }

      thisPromise._state = aState.name;
      aState.data.initialized.push(thisPromise);

      aState.onExit = function () {
        $log.debug('Cleaning up obsolete promise from state: ' + aState.name);
        var index = aState.data.initialized.indexOf(aState);
        aState.data.initialized.splice(index, 1);
      };
    }

    function getClusterEndpoint(cluster) {
      if (!cluster) {
        return '';
      }
      return cluster.api_endpoint.Scheme + '://' + cluster.api_endpoint.Host;
    }

    function sanitizeString(string) {
      return string.replace(/\.|#/g, '_');
    }

    function getOemConfiguration() {
      return $window.env.OEM_CONFIG;
    }
  }

  mbToHumanSizeFilter.$inject = [
    'app.utils.utilsService'
  ];

  function mbToHumanSizeFilter(utilsService) {
    return function (input) {
      return utilsService.mbToHumanSize(input);
    };
  }

  sanitizeStringFilter.$inject = [
    'app.utils.utilsService'
  ];

  function sanitizeStringFilter(utilsService) {
    return function (input) {
      return utilsService.sanitizeString(input);
    };
  }

  function extractCloudFoundryError(errorResponse) {
    /*
     Cloud Foundry errors have the following format:
     data: {
     description: 'some text',
     errorCode: 1000,
     error_code: 'UnknownHostException'
     }
     */
    var errorText;

    if (_.isUndefined(errorResponse) || _.isNull(errorResponse)) {
      return;
    }
    if (errorResponse.data && errorResponse.data.error_code) {
      errorResponse = errorResponse.data;
    }

    if (errorResponse.description && _.isString(errorResponse.description)) {
      errorText = errorResponse.description;
    }

    if (errorResponse.error_code && _.isString(errorResponse.error_code)) {
      errorText = errorText + gettext(', Error Code: ') + errorResponse.error_code;
    }

    return errorText;
  }

  function extractCodeEngineError(errorResponse) {

    /*
     Code Engine errors have the following format
     data: {
     message: 'some text',
     detail: 'more text',
     }
     */

    if (_.isUndefined(errorResponse) || _.isNull(errorResponse)) {
      return;
    }
    var errorText;
    if (errorResponse.data && errorResponse.data.message) {
      errorResponse = errorResponse.data;
    }

    if (errorResponse.message && _.isString(errorResponse.message)) {
      errorText = errorResponse.message;
      if (errorResponse.details || errorResponse.detail) {
        var detail = errorResponse.details || errorResponse.detail;
        if (_.isString(detail)) {
          errorText = errorText + ', ' + detail;
        }
      }
    }

    return errorText;
  }

  /* eslint-disable complexity */

  function getSensibleTime(timeInMilis) {

    var seconds = Math.floor(timeInMilis / 1000 % 60);
    var minutes = Math.floor(timeInMilis / (1000 * 60) % 60);
    var hours = Math.floor(timeInMilis / (1000 * 3600) % 24);
    var days = Math.floor(timeInMilis / (1000 * 3600 * 24) % 30);
    var months = Math.floor(timeInMilis / (1000 * 3600 * 24 * 30) % 12);

    var timeString = '';
    var monthsSet = false;

    if (months > 0) {
      timeString = months + 'm ';
      monthsSet = true;
    }
    var daysSet = false;
    if (days > 0 || monthsSet) {
      timeString = timeString + days + 'd ';
      daysSet = true;
    }

    if (hours > 0 || daysSet) {
      timeString = timeString + hours + 'h ';
    }

    if (minutes > 0 || hours > 0 || daysSet) {
      timeString = timeString + minutes + 'm ';
    }

    if (seconds > 0 || minutes > 0 || hours > 0 || daysSet) {
      timeString = timeString + seconds + 's ';
    } else {
      if (seconds === 0 && minutes === 0 && hours === 0) {
        timeString = gettext('Less than a second');
      }
    }

    return timeString;
  }

  /* eslint-enable complexity */

  function timeTickFormatter(d) {
    var hours = Math.floor(moment.duration(moment().diff(moment(d * 1000))).asHours());
    if (hours === 0) {
      var minutes = Math.floor(moment.duration(moment().diff(moment(d * 1000))).asMinutes());
      if (minutes === 0) {
        return '<1 MIN';
      }
      return minutes + 'MIN';
    } else if (hours <= 2) {
      hours = Math.floor(moment.duration(moment().diff(moment(d * 1000))).asMinutes());
      return hours + 'MIN';
    }
    return hours + 'HR';
  }
})();
