(function () {
  'use strict';

  angular
    .module('app.framework.widgets')
    .directive('tableInlineMessage', tableInlineMessage);

  /**
   * @namespace app.framework.widgets.tableInlineMessage
   * @memberof app.framework.widgets
   * @name tableInlineMessage
   * @description A table-inline-message directive
   * @returns {object} The table-inline-message directive definition object
   */
  function tableInlineMessage() {

    return {
      bindToController: {
        message: '@',
        status: '@',
        link: '@?',
        colSpan: '@?'
      },
      controller: InlineMessageController,
      controllerAs: 'tableInlineMessageCtrl',
      scope: {},
      templateUrl: 'framework/widgets/table-inline-message/table-inline-message.html'
    };
  }

  function InlineMessageController($state) {

    this.statusClass = 'hpe-popover-alert-' + (this.status ? this.status : 'warning');

    this.openLink = function () {
      var link = this.link;
      var parts = link.split('/');
      var params = {};
      var state = parts[0];
      if (parts.length > 1) {
        _.each(parts[1].split(','), function (p) {
          var kv = p.split(':');
          params[kv[0]] = kv[1];
        });
      }

      $state.go(state, params);
    };
  }
})();
