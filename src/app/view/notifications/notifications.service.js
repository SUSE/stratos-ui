(function () {
  'use strict';

  angular
    .module('app.view')
    .factory('app.view.notificationsService', notificationsFactory);

  notificationsFactory.$inject = [
    '$interpolate',
    'appEventEventService',
    'helion.framework.widgets.toaster'
  ];

  /**
   * @memberof cloud-foundry.view.applications.services
   * @name notifications
   * @description A notifications service
   * @param {object} $interpolate - the angular $interpolate service
   * @param {appEventEventService} appEventEventService - the application event bus service
   * @param {helion.framework.widgets.toaster} toaster - the toast service
   * @returns {object} A service instance factory
   */
  function notificationsFactory($interpolate, appEventEventService, toaster) {
    var service = {
      /**
       * @function notify
       * @memberof app.view.notificationsService
       * @description Show a toast notification
       * @param {string} toastType - the toast notification type (i.e. success, warning)
       * @param {string} message - the toast message
       * @param {object=} interpolateScope - optional scope used for interpolating message
       * @param {object=} toastOptions - optional override options for toast
       * @returns {object} The toast object
       * @public
       */
      notify: function (toastType, message, interpolateScope, toastOptions) {

        var interpolatedMessage;
        if (interpolateScope) {
          // Escape possible HTML properties in interpolateScope
          _.forEach(interpolateScope, function (val, key) {
            if (_.isString(val)) {
              interpolateScope[key] = _.escape(val);
            }
          });
          interpolatedMessage = $interpolate(message)(interpolateScope);
        } else {
          interpolatedMessage = message;
        }
        switch (toastType) {
          case 'busy':
            return toaster.busy(interpolatedMessage, toastOptions);
          case 'error':
            return toaster.error(interpolatedMessage, toastOptions);
          case 'success':
            return toaster.success(interpolatedMessage, toastOptions);
          case 'warning':
            return toaster.warning(interpolatedMessage, toastOptions);
          default:
            return toaster.show(interpolatedMessage, toastType, toastOptions);
        }
      }
    };

    appEventEventService.$on('cf.events.NOTIFY', function (event, config) {
      service.notify(config.toastType, config.message, config.scope, config.options);
    });
    appEventEventService.$on('cf.events.NOTIFY_BUSY', function (event, config) {
      service.notify('busy', config.message, config.scope, config.options);
    });
    appEventEventService.$on('cf.events.NOTIFY_ERROR', function (event, config) {
      service.notify('error', config.message, config.scope, config.options);
    });
    appEventEventService.$on('cf.events.NOTIFY_SUCCESS', function (event, config) {
      service.notify('success', config.message, config.scope, config.options);
    });
    appEventEventService.$on('cf.events.NOTIFY_WARNING', function (event, config) {
      service.notify('warning', config.message, config.scope, config.options);
    });

    return service;
  }

})();
