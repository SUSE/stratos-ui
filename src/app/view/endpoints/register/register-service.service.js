(function () {
  'use strict';

  angular
    .module('app.view')
    .factory('app.view.registerService', ServiceRegistrationService);

  ServiceRegistrationService.$inject = [
    '$q',
    'app.model.modelManager',
    'app.view.notificationsService',
    'helion.framework.widgets.asyncTaskDialog',
    'app.utils.utilsService'
  ];

  /**
   * @name ServiceRegistrationService
   * @description Register a service via a slide out
   * @namespace app.view.registerService.ServiceRegistrationService
   * @param {object} $q - the Angular $q service
   * @param {app.model.modelManager} modelManager The console model manager service
   * @param {app.view.notificationsService} notificationsService The console notification service
   * @param {helion.framework.widgets.asyncTaskDialog} asyncTaskDialog The framework async detail view
   * @param {app.utils.utilsService} utilsService - the console utils service
   * @property {function} add Opens slide out containing registration form
   * @constructor
   */
  function ServiceRegistrationService($q, modelManager, notificationsService, asyncTaskDialog, utilsService) {
    var serviceInstanceModel = modelManager.retrieve('app.model.serviceInstance');

    function createInstances(serviceInstances, filter) {
      var filteredInstances = _.filter(serviceInstances, {cnsi_type: filter});
      return _.map(filteredInstances,
        function (c) {
          var endpoint = c.api_endpoint;
          return endpoint.Scheme + '://' + endpoint.Host;
        });
    }

    return {
      /**
       * @name add
       * @description Opens slide out containing registration form
       * @namespace app.view.registerService.ServiceRegistrationService
       * @param {string} type The type of service. For example hce or hcf
       * @param {string} title The title of the detail view
       * @param {string=} description optional description to add in the detail view
       * @param {string=} urlHint optional hint to use for the URL field
       * @returns {promise}
       */
      add: function (type, title, description, urlHint) {
        var data = {
          name: '',
          url: '',
          skipSslValidation: false
        };
        var context = {
          data: data,
          instances: createInstances(serviceInstanceModel.serviceInstances, type),
          description: description,
          urlHint: urlHint,
          urlFormName: type + 'Url',
          nameFormName: type + 'Name',
          urlValidationExpr: utilsService.urlValidationExpression
        };
        return asyncTaskDialog(
          {
            title: title,
            templateUrl: 'app/view/endpoints/register/register-service.html',
            class: 'detail-view-thin',
            buttonTitles: {
              submit: gettext('Register')
            }
          },
          context,
          function () {

            if (context.customErrorMsg) {
              delete context.errorMsg;
              delete context.customErrorMsg;
            }
            return serviceInstanceModel.create(type, data.url, data.name, data.skipSslValidation).then(function (serviceInstance) {
              var typeString = 'Helion ' + (type === 'hcf' ? 'Cloud Foundry' : 'Code Engine');
              notificationsService.notify('success',
                gettext('{{endpointType}} endpoint \'{{name}}\' successfully registered'),
                {endpointType: typeString, name: data.name});
              return serviceInstance;
            }).catch(function (response) {
              if (response.status === 403) {
                context.errorMsg = gettext('Endpoint uses a certificate signed by an unknown authority.' +
                  ' Please check "Skip SSL validation for the endpoint" if the certificate issuer is trusted.');
                // Set flag to indicate that we are setting an error message in code, should be unset upon next retry
                context.customErrorMsg = true;
              }
              return $q.reject(response);
            });
          }
        ).result;
      }
    };
  }

})();
