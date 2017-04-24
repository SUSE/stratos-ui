/* eslint-disable angular/json-functions,angular/log,no-console */
(function () {
  'use strict';

  var sh = require('shelljs');
  var request = require('request');
  var path = require('path');
  var fs = require('fs');
  var Q = require('q');
  var _ = require('lodash');

  // Get host IP
  var CMD = "/sbin/ip route|awk '/default/ { print $3 }'";
  var hostProtocol = browser.params.protocol || 'https://';
  var hostIp = browser.params.host || sh.exec(CMD, {silent: true}).output.trim();
  var hostPort = browser.params.port || '';
  var host = hostProtocol + hostIp + (hostPort ? ':' + hostPort : '');

  var cnsis = browser.params.cnsi;
  var hcfs = cnsis.hcf || {};
  var hces = cnsis.hce || {};
  var adminUser = browser.params.credentials.admin.username;
  var adminPassword = browser.params.credentials.admin.password;
  var user = browser.params.credentials.user.username;
  var password = browser.params.credentials.user.password;
  var githubTokenName = browser.params.github.valid.tokenName;
  var githubNewTokenName = browser.params.github.valid.newTokenName;
  var githubToken = browser.params.github.valid.token;
  var githubRepository = browser.params.github.repository;
  var githubInvalidTokenName = browser.params.github.invalid.tokenName;
  var githubInvalidToken = browser.params.github.invalid.token;

  var branchNames = browser.params.pipelineDetails.branchNames;
  var buildContainer = browser.params.pipelineDetails.buildContainer;

  // This makes identification of acceptance test apps easier in case they leak
  var customAppLabel = process.env.CUSTOM_APP_LABEL || process.env.USER;

  module.exports = {

    getHost: getHost,
    getCNSIs: getCNSIs,
    getHcfs: getHcfs,
    getHces: getHces,
    getAdminUser: getAdminUser,
    getAdminPassword: getAdminPassword,
    getUser: getUser,
    getPassword: getPassword,

    skipIfNoHCF: skipIfNoHCF,
    skipIfNoHCE: skipIfNoHCE,
    skipIfNoHCFHCE: skipIfNoHCFHCE,
    skipIfNoSecondHCF: skipIfNoSecondHCF,
    skipIfNoAppWithLogStrean: skipIfNoAppWithLogStrean,

    getAppNameWithLogStream: getAppNameWithLogStream,

    getGithubTokenName: getGithubTokenName,
    getGithubNewTokenName: getGithubNewTokenName,
    getGithubToken: getGithubToken,
    getGithubInvalidTokenName: getGithubInvalidTokenName,
    getGithubInvalidToken: getGithubInvalidToken,
    getGithubRepository: getGithubRepository,
    getBranchNames: getBranchNames,
    getBuildContainer: getBuildContainer,

    newBrowser: newBrowser,
    loadApp: loadApp,
    setBrowserNormal: setBrowserNormal,
    setBrowserSmall: setBrowserSmall,
    setBrowserWidthSmall: setBrowserWidthSmall,

    getForm: getForm,
    getFormFields: getFormFields,
    getFormField: getFormField,
    getAttribute: getAttribute,
    getFieldType: getFieldType,

    getTableRows: getTableRows,
    getTableRowAt: getTableRowAt,
    getTableCellAt: getTableCellAt,

    closeFlyout: closeFlyout,

    checkAndCloseToast: checkAndCloseToast,

    newRequest: newRequest,
    sendRequest: sendRequest,
    createSession: createSession,
    createReqAndSession: createReqAndSession,

    forceDate: forceDate,
    resetDate: resetDate,

    getCnsiForUrl: getCnsiForUrl,

    hasClass: hasClass,
    isButtonEnabled: isButtonEnabled,

    getCustomAppLabel: getCustomAppLabel
  };

  function getHost() {
    return host;
  }

  function getCNSIs() {
    return cnsis;
  }

  function getHcfs() {
    return hcfs;
  }

  function getHces() {
    return hces;
  }

  function getAdminUser() {
    return adminUser;
  }

  function getAdminPassword() {
    return adminPassword;
  }

  function getUser() {
    return user;
  }

  function getPassword() {
    return password;
  }

  function getGithubTokenName() {
    return githubTokenName;
  }

  function getGithubToken() {
    return githubToken;
  }

  function getGithubInvalidTokenName() {
    return githubInvalidTokenName;
  }

  function getGithubInvalidToken() {
    return githubInvalidToken;
  }

  function getGithubNewTokenName() {
    return githubNewTokenName;
  }

  function getGithubRepository() {
    return githubRepository;
  }

  function getBranchNames() {
    return branchNames;
  }

  function getBuildContainer() {
    return buildContainer;
  }

  function newBrowser() {
    return browser.forkNewDriverInstance(true);
  }

  function loadApp(keepCookies) {
    if (!keepCookies) {
      browser.manage().deleteAllCookies();
    }
    return browser.get(host);
  }

  function setBrowserNormal() {
    browser.manage().window().setSize(1366, 768);
  }

  function setBrowserSmall() {
    browser.manage().window().setSize(640, 480);
  }

  function setBrowserWidthSmall() {
    browser.manage().window().setSize(640, 768);
  }

  /*
   * Form helpers
   */
  function getForm(formName) {
    return element(by.css('form[name="' + formName + '"]'));
  }

  function getFormFields(formName) {
    return getForm(formName).all(by.css('input, textarea, select'));
  }

  function getFormField(formName, fieldName) {
    return getForm(formName).element(by.css('[name="' + fieldName + '"]'));
  }

  function getAttribute(field, attr) {
    return field.getAttribute(attr);
  }

  function getFieldType(field) {
    return getAttribute(field, 'type');
  }

  /*
   * Table helpers
   */
  function getTableRows(table) {
    return table.all(by.css('tbody tr'));
  }

  function getTableRowAt(table, rowIndex) {
    return table.all(by.css('tbody tr')).get(rowIndex);
  }

  function getTableCellAt(table, rowIndex, colIndex) {
    return getTableRows(table).get(rowIndex).all(by.css('td')).get(colIndex);
  }

  function getCustomAppLabel() {
    return customAppLabel;
  }

  /*
   * Flyout helpers
   */
  function closeFlyout() {
    element(by.css('flyout'))
      .element(by.css('.flyout-header button.close')).click();
  }

  /*
   * Toast notification helpers
   */

  /**
   * @description Look for a toast notification matching the passed RegExp or string and
   * close the first one that matches
   * @param {Object} matchStringOrRegex a string or RegExp that will be compared against
   * the text contents of active toasts
   * @returns {Object} a promise that will be resolved when the toast is found and closed
   * or rejected if no matching toast is found
   * */
  function checkAndCloseToast(matchStringOrRegex) {

    var testMatch;
    if (_.isRegExp(matchStringOrRegex)) {
      testMatch = function (testString) {
        return matchStringOrRegex.test(testString);
      };
    } else {
      testMatch = function (testString) {
        return matchStringOrRegex === testString;
      };
    }

    return element.all(by.css('.toast-helion')).then(function (toasts) {
      var promises = [];
      for (var i = 0; i < toasts.length; i++) {
        promises.push(toasts[i].getText());
      }
      return Q.all(promises).then(function (allText) {
        for (var i = 0; i < allText.length; i++) {
          var toastText = allText[i];
          if (testMatch(toastText)) {
            return toasts[i].element(by.css('.toast-close-button')).click();
          }
        }
        return Q.reject('Toast with message matching ' + matchStringOrRegex + ' not found.' +
          ' We found the following toasts instead: ' + JSON.stringify(allText));
      });
    });
  }

  /**
   * Manage requests + sessions
   */

  /**
   * @function createReqAndSession
   * @description
   * @param {object?} optionalReq - convenience, wraps in promise as if req did not exist
   * @param {string?} username -
   * @param {string?} password -
   * @returns {Promise} A promise containing req
   */
  function createReqAndSession(optionalReq, username, password) {
    var req;

    if (!optionalReq) {
      req = newRequest();

      username = username || getAdminUser();
      password = password || getAdminPassword();

      return createSession(req, username, password).then(function () {
        return req;
      });
    } else {
      return Q.resolve(optionalReq);
    }
  }

  /**
   * @function newRequest
   * @description Create a new request
   * @returns {object} A newly created request
   */
  function newRequest() {
    var cookieJar = request.jar();
    var skipSSlValidation = browser.params.skipSSlValidation;
    var ca;

    /* eslint-disable no-sync,no-process-env */
    if (skipSSlValidation) {
      process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    } else if (browser.params.caCert) {
      var caCertFile = path.join(__dirname, '..', '..', 'tools');
      caCertFile = path.join(caCertFile, browser.params.caCert);
      if (fs.existsSync(caCertFile)) {
        ca = fs.readFileSync(caCertFile);
      }
    }
    /* eslint-enable no-sync,no-process-env */

    return request.defaults({
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      agentOptions: {
        ca: ca
      },
      jar: cookieJar
    });
  }

  /**
   * @function sendRequest
   * @description Send request
   * @param {object} req - the request
   * @param {object} options -
   * @param {object?} body - the request body
   * @param {object?} formData - the form data
   * @returns {Promise} A promise
   */
  function sendRequest(req, options, body, formData) {
    return new Promise(function (resolve, reject) {
      options.url = getHost() + '/' + options.url;
      if (body) {
        options.body = JSON.stringify(body);
      } else if (formData) {
        options.formData = formData;
      }

      var data = '';
      var rejected;
      req(options)
        .on('data', function (responseData) {
          data += responseData;
        })
        .on('error', function (error) {
          reject('send request failed: ', error);
        })
        .on('response', function (response) {
          if (response.statusCode > 399) {
            reject('failed to send request: ' + JSON.stringify(response));
            rejected = true;
          }
        })
        .on('end', function () {
          if (!rejected) {
            resolve(data);
          }
        });
    });
  }

  /**
   * @function createSession
   * @description Create a session
   * @param {object} req - the request
   * @param {string} username - the Stackato username
   * @param {string} password - the Stackato password
   * @returns {Promise} A promise
   */
  function createSession(req, username, password) {
    return new Promise(function (resolve, reject) {
      var options = {
        formData: {
          username: username || 'dev',
          password: password || 'dev'
        }
      };
      req.post(getHost() + '/pp/v1/auth/login/uaa', options)
        .on('error', reject)
        .on('response', function (response) {
          if (response.statusCode === 200) {
            resolve();
          } else {
            console.log('Failed to create session. ' + JSON.stringify(response));
            reject('Failed to create session');
          }
        });
    });
  }

  /**
   * @function forceDate
   * @description Force the Date constructor to always return a given YEAR/MONTH/DAY
   * @param {number} year - the year
   * @param {number} month - the month
   * @param {number} day - the day
   */
  function forceDate(year, month, day) {
    browser.driver.executeScript('' +
      '__forceDate_oldDate=Date; Date = function(){ return new __forceDate_oldDate(' + year + ', ' + month + ',' + day + ')};'
    );
  }

  /**
   * @function resetDate
   * @description Reset the Date constructor back to normal
   */
  function resetDate() {
    browser.driver.executeScript('' +
      'Date=__forceDate_oldDate; delete __forceDate_oldDate;'
    );
  }

  /**
   * @function getCnsiForUrl
   * @param {string} url - url
   * @description Find the CNSI for the given URL - useful for getting right credentials
   * @returns {object} cnsi config object
   */
  function getCnsiForUrl(url) {
    var cnsiType, cnsiId;
    for (cnsiType in cnsis) {
      if (cnsis.hasOwnProperty(cnsiType)) {
        for (cnsiId in cnsis[cnsiType]) {
          if (cnsis[cnsiType].hasOwnProperty(cnsiId)) {
            var cnsi = cnsis[cnsiType][cnsiId];
            if (cnsi.register.api_endpoint.indexOf(url) >= 0) {
              return cnsi;
            }
          }
        }
      }
    }
    return null;
  }

  function hasClass(element, cls) {
    return element.getAttribute('class')
      .then(function (classes) {
        return classes.split(' ').indexOf(cls) !== -1;
      });
  }

  function isButtonEnabled(element) {
    return element.getAttribute('disabled')
      .then(function (isDisabled) {
        if (isDisabled === 'true') {
          return false;
        }
        if (isDisabled === 'false') {
          return true;
        }
        return isDisabled !== 'disabled';
      })
      .catch(function () {
        // no disabled attribute --> enabled button
        return true;
      });
  }

  // Test skip helpers
  function skipIfNoHCF() {
    return !getHcfs() || !getHcfs().hcf1;
  }

  function skipIfNoHCE() {
    return !getHces() || !getHces().hce1;
  }

  function skipIfNoHCFHCE() {
    return skipIfNoHCF() || skipIfNoHCE();
  }

  function skipIfNoSecondHCF() {
    return !getHcfs() || !getHcfs().hcf2;
  }

  function skipIfOnlyOneHCF() {
    return !getHcfs() || Object.keys(getHcfs()).length < 2;
  }

  function skipIfNoAppWithLogStrean() {
    var haveNcf = getHcfs() && Object.keys(getHcfs()).length > 0;
    return !haveNcf || !browser.params.appWithLogStream;
  }

  function getAppNameWithLogStream() {
    return browser.params.appWithLogStream;
  }

})();
