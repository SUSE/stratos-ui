/* eslint-disable angular/json-functions,angular/log,no-console,no-throw-literal */
(function () {
  'use strict';

  var _ = require('lodash');

  module.exports = function (_module) {
    if (!_module.exports.wrap) {
      _module.exports.wrap = function (element) {
        var wrappers = {};
        _.each(_module.exports, function (value, key) {
          if (_.isFunction(value)) {
            wrappers[key] = _.partial(value, element);
          }
        });
        if (!wrappers.getElement) {
          wrappers.getElement = function () {
            return element;
          };
        }
        if (!wrappers.getWebElement) {
          wrappers.getWebElement = function () {
            return element.getWebElement();
          };
        }
        return wrappers;
      };
    }
  };
})();
