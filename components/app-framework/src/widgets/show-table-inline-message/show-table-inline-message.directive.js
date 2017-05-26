(function () {
  'use strict';

  angular
    .module('app.framework.widgets')
    .directive('showTableInlineMessage', showTableInlineMessage);

  /**
   * @namespace app.framework.widgets.showTableInlineMessage
   * @memberof app.framework.widgets
   * @name showTableInlineMessage
   * @description A show-table-inline-message directive
   * @param {object} $compile - the $compile service
   * @returns {object} The show-table-inline-message directive definition object
   */
  function showTableInlineMessage($compile) {
    return {
      link: link
    };

    function link(scope, element, attrs) {

      var elem = angular.element('<tr table-inline-message></tr>');
      setMessage(attrs.showTableInlineMessage, true);
      setStatus(attrs.tableInlineStatus, true);
      setColSpan(attrs.inlineMessageColspan, true);
      setLink(attrs.inlineMessageLink, true);
      element.after(elem);

      $compile(elem)(scope);

      // This is the proper way of observing attributes from a link function
      attrs.$observe('showTableInlineMessage', setMessage);
      attrs.$observe('tableInlineStatus', setStatus);
      attrs.$observe('inlineMessageColspan', setColSpan);
      attrs.$observe('inlineMessageLink', setLink);

      function setMessage(message, skipCompile) {
        if (message === elem.attr('message')) {
          return;
        }
        elem[message ? 'removeClass' : 'addClass']('hide-message');
        elem.attr('message', message);
        if (!skipCompile) {
          $compile(elem)(scope);
        }
      }

      function setStatus(newStatus, skipCompile) {
        if (newStatus === elem.attr('status')) {
          return;
        }
        elem.attr('status', newStatus || 'warning');
        if (!skipCompile) {
          $compile(elem)(scope);
        }
      }

      function setColSpan(newColSpan, skipCompile) {
        var colSpan = newColSpan || '100';
        if (colSpan === elem.attr('col-span')) {
          return;
        }
        elem.attr('col-span', colSpan);
        if (!skipCompile) {
          $compile(elem)(scope);
        }
      }

      function setLink(newLink, skipCompile) {
        elem.attr('link', newLink);
        if (!skipCompile) {
          $compile(elem)(scope);
        }
      }
    }
  }

})();
