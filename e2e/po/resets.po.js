'use strict';

var request = require('../../tools/node_modules/request');
var helpers = require('./helpers.po');
var fs = require('fs');
var path = require('path');

var host = helpers.getHost();

module.exports = {

  devWorkflow: devWorkflow,

  resetAllCnsi: resetAllCnsi,
  removeAllCnsi: removeAllCnsi

};

/**
 * @function devWorkflow
 * @description Ensure the database is initialized for developer
 * workflow.
 * @param {boolean} firstTime - flag this as a first-time run
 * @returns {promise} A promise
 */
function devWorkflow(firstTime) {
  var req = newRequest();

  return new Promise(function (resolve, reject) {
    createSession(req, helpers.getUser(), helpers.getPassword()).then(function () {
      var promises = [];
      promises.push(setUser(req, !firstTime));
      promises.push(_resetAllCNSI(req));

      if (firstTime) {
        promises.push(removeUserServiceInstances(req));
      } else {
        promises.push(resetUserServiceInstances(req));
      }

      Promise.all(promises).then(function () {
        resolve();
      }, function (error) {
        console.log('Failed to set dev workflow');
        reject(error);
      }, function (error) {
        reject(error);
      });
    });
  });
}

/**
 * @function removeAllCnsi
 * @description Ensure the database is initialized for ITOps
 * admin workflow with no clusters registered.
 * @param {string?} username the username used ot create a session token
 * @param {string?} password the username used ot create a session token
 * @returns {promise} A promise
 */
function removeAllCnsi(username, password) {
  var req = newRequest();

  username = username || helpers.getAdminUser();
  password = password || helpers.getAdminPassword();

  return new Promise(function (resolve, reject) {
    createSession(req, username, password).then(function () {
      _removeAllCnsi(req).then(function () {
        resolve();
      }, function (error) {
        console.log('Failed to remove all cnsi: ', error);
        reject(error);
      }).catch(reject);
    }, function (error) {
      reject(error);
    });
  });
}

/**
 * @function resetAllCnsi
 * @description Ensure the database is initialized for ITOps
 * admin workflow with the clusters provided as params.
 * @param {string?} username the username used ot create a session token
 * @param {string?} password the username used ot create a session token
 * @returns {promise} A promise
 */
function resetAllCnsi(username, password) {
  var req = newRequest();

  username = username || helpers.getAdminUser();
  password = password || helpers.getAdminPassword();

  return new Promise(function (resolve, reject) {
    createSession(req, username, password).then(function () {
      _resetAllCNSI(req).then(function () {
        resolve();
      }, function (error) {
        console.log('Failed to reset all cnsi: ', error);
        reject(error);
      }).catch(reject);
    }, function (error) {
      reject(error);
    });
  });
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

  if (skipSSlValidation) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  } else if (browser.params.caCert) {
    var caCertFile = path.join(__dirname, '..', '..', 'tools');
    caCertFile = path.join(caCertFile, browser.params.caCert);
    if (fs.existsSync(caCertFile)) {
      ca = fs.readFileSync(caCertFile);
    }
  }

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
 * @param {string} method - the request method (GET, POST, ...)
 * @param {string} url - the request URL
 * @param {object?} body - the request body
 * @param {object?} formData - the form data
 * @returns {Promise} A promise
 */
function sendRequest(req, method, url, body, formData) {
  return new Promise(function (resolve, reject) {
    var options = {
      method: method,
      url: host + '/' + url
    };
    if (body && body.length) {
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
    req.post(host + '/pp/v1/auth/login/uaa', options)
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
 * @function resetClusters
 * @description Reset clusters to original state
 * @param {object?} optionalReq - the request
 * @returns {promise} A promise
 */
function _resetAllCNSI(optionalReq) {
  var req = optionalReq || newRequest();
  return new Promise(function (resolve, reject) {
    _removeAllCnsi(req).then(function () {
      var hcfs = helpers.getHcfs();

      var promises = [];
      var c;
      for (c in hcfs) {
        if (!hcfs.hasOwnProperty(c)) {
          continue;
        }
        promises.push(sendRequest(req, 'POST', 'pp/v1/register/hcf', null, hcfs[c].register));
      }
      var hces = helpers.getHces();
      for (c in hces) {
        if (!hces.hasOwnProperty(c)) {
          continue;
        }
        promises.push(sendRequest(req, 'POST', 'pp/v1/register/hce', null, hces[c].register));
      }

      Promise.all(promises).then(function () {
        resolve();
      }, function (error) {
        reject(error);
      });
    }, reject).catch(reject);
  });
}

/**
 * @function removeClusters
 * @description Remove all clusters
 * @param {object?} optionalReq - the request
 * @returns {Promise} A promise
 */
function _removeAllCnsi(optionalReq) {
  var req = optionalReq || newRequest();
  return new Promise(function (resolve, reject) {
    sendRequest(req, 'GET', 'pp/v1/cnsis').then(function (data) {
      data = data.trim();
      data = JSON.parse(data);

      if (!data || !data.length) {
        resolve();
        return;
      }
      var promises = data.map(function (c) {
        return sendRequest(req, 'POST', 'pp/v1/unregister', '', {cnsi_guid: c.guid});
      });
      Promise.all(promises).then(resolve, reject);

    }, reject);

  });
}

/**
 * @function resetUserServiceInstances
 * @description Reset user service instances to original state
 * @param {object} req - the request
 * @returns {Promise} A promise
 */
function resetUserServiceInstances(req) {
  throw 'deprecated (contacts old endpoint, needs updating';

  // return new Promise(function (resolve, reject) {
  //   removeUserServiceInstances(req).then(function () {
  //     var serviceInstancesToAdd = [
  //       'api.15.126.233.29.xip.io',
  //       'api.12.163.29.3.xip.io',
  //       'api.15.13.32.22.xip.io'
  //     ];
  //     var postUrl = 'service-instances/user/connect';
  //     var promises = serviceInstancesToAdd.map(function (instanceUrl) {
  //       return sendRequest(req, 'POST', postUrl, { url: instanceUrl });
  //     });
  //     Promise.all(promises).then(function () {
  //       resolve();
  //     });
  //   }, reject);
  // });
}

/**
 * @function removeUserServiceInstances
 * @description Remove all user service instances
 * @param {object} req - the request
 * @returns {Promise} A promise
 */
function removeUserServiceInstances(req) {
  throw 'deprecated (contacts old endpoint, needs updating';

  // return new Promise(function (resolve, reject) {
  //   var data = '';
  //   req.get('http://' + host + '/api/service-instances/user')
  //     .on('data', function (responseData) {
  //       data += responseData;
  //     })
  //     .on('end', function () {
  //       if (data && data !== '') {
  //         var items = JSON.parse(data).items || [];
  //         if (items.length > 0) {
  //           var promises = items.map(function (c) {
  //             var url = 'service-instances/user/' + c.id;
  //             return sendRequest(req, 'DELETE', url, {});
  //           });
  //           Promise.all(promises).then(function () {
  //             resolve();
  //           });
  //         } else {
  //           resolve();
  //         }
  //       } else {
  //         resolve();
  //       }
  //     })
  //     .on('error', reject);
  // });
}

/**
 * @function setUser
 * @description Set user registered state
 * @param {object} req - the request
 * @param {boolean} registered - the registered state
 * @returns {Promise} A promise
 */
function setUser(req, registered) {
  throw 'deprecated (contacts old endpoint, needs updating';

  // return new Promise(function (resolve, reject) {
  //   var data = '';
  //   req.get('http://' + host + '/api/users/loggedIn')
  //     .on('data', function (responseData) {
  //       data += responseData;
  //     })
  //     .on('end', function () {
  //       var user = JSON.parse(data);
  //       var body = { registered: registered };
  //       if (Object.keys(user).length === 0) {
  //         sendRequest(req, 'POST', 'users', body)
  //           .then(function () {
  //             resolve();
  //           }, reject);
  //       } else if (user.registered !== registered) {
  //         sendRequest(req, 'PUT', 'users/' + user.id, body)
  //           .then(function () {
  //             resolve();
  //           }, reject);
  //       }
  //     })
  //     .on('error', reject);
  // });
}
