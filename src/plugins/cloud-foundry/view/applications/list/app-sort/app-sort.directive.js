(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.list')
    .directive('applicationsSorting', applicationsSorting);

  applicationsSorting.$inject = [];

  function applicationsSorting() {
    return {
      controller: ApplicationsSortingController,
      controllerAs: 'applicationsSortingCtrl',
      templateUrl: 'plugins/cloud-foundry/view/applications/list/' +
      'app-sort/app-sort.html'
    };
  }

  ApplicationsSortingController.$inject = [
    '$scope',
    'app.model.modelManager'
  ];

  /**
   * @name ApplicationsSortingController
   * @description Controller for app-sort directive
   * @constructor
   * @param {object} $scope - the Angular $scope service
   * @param {app.model.modelManager} modelManager - the Model management service
   * @property {object} $scope - the Angular $scope service
   * @property {app.model.modelManager} modelManager - the Model management service
   */
  function ApplicationsSortingController($scope, modelManager) {

    var that = this;
    this.model = modelManager.retrieve('cloud-foundry.model.application');

    this.sortOptions = [
      {label: 'App Name (a-z)', value: 'entity.name.asc', sort: 'entity.name', ascending: true},
      {label: 'App Name (z-a)', value: 'entity.name.desc', sort: 'entity.name', ascending: false},
      // These rely on app state, which we don't have yet
      //{label: 'Status (a-z)', value: 'state.label.asc', sort: 'state.label', ascending: true},
      //{label: 'Status (z-a)', value: 'state.label.desc', sort: 'state.label', ascending: false},
      {label: 'Instances (Low-High)', value: 'instanceCount.asc', sort: 'entity.instances', ascending: true},
      {label: 'Instances (High-Low)', value: 'instanceCount.desc', sort: 'entity.instances', ascending: false},
      {label: 'Disk Quota (Low-High)', value: 'entity.disk_quota.asc', sort: 'entity.disk_quota', ascending: true},
      {label: 'Disk Quota (High-Low)', value: 'entity.disk_quota.desc', sort: 'entity.disk_quota', ascending: false},
      {label: 'Memory (Low-High)', value: 'entity.memory.asc', sort: 'entity.memory', ascending: true},
      {label: 'Memory (High-Low)', value: 'entity.memory.desc', sort: 'entity.memory', ascending: false},
      {label: 'Newest', value: 'metadata.created_at.asc', sort: 'metadata.created_at', ascending: false},
      {label: 'Oldest', value: 'metadata.created_at.desc', sort: 'metadata.created_at', ascending: true}
    ];

    // Default to sorting with the newest applications first
    this.model.currentSortOption = this.model.currentSortOption || 'metadata.created_at';
    this.model.sortAscending = angular.isDefined(this.model.sortAscending) ? this.model.sortAscending : false;

    // Used to toggle display of sort action buttons when screen width is too small
    this.showSortActions = true;

    // Find the menu item that matches the current sort order
    var selectedSortItem = _.find(this.sortOptions, {sort: this.model.currentSortOption, ascending: this.model.sortAscending});
    this.selectedOption = selectedSortItem.value;

    // If currentSortOption and sort order change update filteredApplications
    $scope.$watch(function () {
      // Combine this into one watch so changes in the same digest only kick off one update
      return that.model.currentSortOption + that.model.sortAscending;
    }, function (newVal, oldVal) {
      if (newVal === oldVal) {
        return;
      }
      that.model.reSort();
    });
  }

  angular.extend(ApplicationsSortingController.prototype, {

    /**
     * @name setSort
     * @description Set the sort option
     */
    setSort: function () {
      var item = _.find(this.sortOptions, {value: this.selectedOption});
      if (item) {
        this.sort({value: item.sort || item.value});
        this.setSortOrder(item.ascending);
      }
    },

    /**
     * @name setSortOrder
     * @description Set sort order (asc/desc)
     * @param {boolean} isAscending - Set sort order
     */
    setSortOrder: function (isAscending) {
      this.model.sortAscending = isAscending;
    },

    /**
     * @name isCurrentSort
     * @description Helper to apply appropriate style to sort button
     * @param {boolean} option - sort option
     * @returns {boolean}
     */
    isCurrentSort: function (option) {
      return option.value === this.model.currentSortOption;
    },

    /**
     * @name showAscending
     * @description Helper to show appropriate sort order button
     * @param {boolean} option - sort option
     * @returns {boolean}
     */
    showAscending: function (option) {
      return this.isCurrentSort(option) && this.model.sortAscending;
    },

    /**
     * @name showDescending
     * @description Helper to show appropriate sort order button
     * @param {boolean} option - sort option
     * @returns {boolean}
     */
    showDescending: function (option) {
      return this.isCurrentSort(option) && !this.model.sortAscending;
    },

    /**
     * @name sort
     * @description Helper to set the appropriate model sort options
     * @param {boolean} option - sort option
     */
    sort: function (option) {
      // when current sort is different by default switch to ascending
      // when current sort is the same toggle order
      if (option.value !== this.model.currentSortOption) {
        this.model.currentSortOption = option.value;
        this.model.sortAscending = true;
      } else if (option.value === this.model.currentSortOption) {
        // Current sort option is already the same, toggle order
        this.model.sortAscending = !this.model.sortAscending;
      }

    },

    /**
     * @name toggleSortActions
     * @description Helper to toggle
     * @param {boolean} option - sort option
     */
    toggleSortActions: function () {
      this.showSortActions = !this.showSortActions;
    },

    getMessage: function () {
      if (this.showSortActions) {
        return gettext('Show Sort');
      } else {
        return gettext('Hide Sort');
      }
    }

  });

})();
