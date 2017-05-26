(function () {
  'use strict';

  angular
    .module('app.framework.widgets')
    .directive('listTable', listTable);

  /**
   * @namespace app.framework.widgets.listTable
   * @memberof app.framework.widgets
   * @name listTable
   * @description
   * The listTable directive presents a list of items in a tabular format using
   * the Smart-Table module.
   * http://lorenzofox3.github.io/smart-table-website/
   *
   * Required: Use `st-table` attribute to pass in the displayed
   * row collection.
   *
   * @returns {object} The table directive definition object
   * @example
   *
   * ```
   * <table st-table='tableData' list-table>
   *  <thead>
   *    <tr>
   *      <th>Name</th>
   *    </tr>
   *  </thead>
   *  <tbody>
   *    <tr ng-repeat="row in tableData">
   *      <td>Foo</td>
   *    </tr>
   *  </tbody>
   * </table>
   * ```
   */
  function listTable() {
    return {
      scope: {},
      restrict: 'A',
      require: 'stTable',
      bindToController: {
        selected: '=?listTable'
      },
      controller: ListTableController,
      controllerAs: 'listTableCtrl'
    };
  }

  /**
   * @namespace app.framework.widgets.ListTableController
   * @memberof app.framework.widgets
   * @name ListTableController
   * @constructor
   */
  function ListTableController() {
    this.selected = [];
  }

  angular.extend(ListTableController.prototype, {
    updateSelected: function (row, checkedState) {
      if (checkedState) {
        this.selected.push(row);
      } else {
        _.remove(this.selected, row);
      }
    }
  });

})();
