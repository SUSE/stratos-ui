(function () {
  'use strict';

  angular
    .module('app.view.metrics')
    .directive('nodeCard', nodeCard);

  nodeCard.$inject = ['app.basePath'];

  function nodeCard(path) {
    return {
      bindToController: {
        nodeName: '='
      },
      controller: NodeCardController,
      controllerAs: 'nodeCardCtrl',
      scope: {},
      templateUrl: path + 'view/metrics/node-card/node-card.html'
    };
  }

  NodeCardController.$inject = [
    '$interval',
    '$state',
    '$scope',
    '$q',
    'app.model.modelManager',
    'app.utils.utilsService'
  ];

  function NodeCardController($interval, $state, $scope, $q, modelManager, utilsService) {

    var that = this;
    this.metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');
    this.$state = $state;
    this.$q = $q;
    this.utilsService = utilsService;
    this.metricsData = {};
    this.cpuLimit = 0;
    this.memoryLimit = 0;

    var interval = $interval(function () {
      that.updateCpuUtilization();
      that.updateMemoryUtilization();
      that.updateNetworkDataTransmitted();
      that.updateNetworkDataReceived();
      that.updateMemoryUtilization();
      that.updateNodeUptime();
    }, 120000);

    this.cardData = {
      title: this.nodeName
    };

    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });

    function init() {
      // prefetch cpu-usage and memory data
      return $q.all([that.updateCpuUtilization(),
        that.updateMemoryUtilization(),
        that.updateNodeUptime(),
        that.updateNetworkDataTransmitted(),
        that.updateNetworkDataReceived(),
        that.fetchLimitMetrics()]);
    }

    utilsService.chainStateResolve('metrics.dashboard', $state, init);
  }

  angular.extend(NodeCardController.prototype, {

    getCardData: function () {
      return this.cardData;
    },

    updateCpuUtilization: function () {
      var that = this;
      return this.metricsModel.getCpuUtilization(this.metricsModel.makeNodeNameFilter(this.nodeName))
        .then(function (metricsData) {
          that.metricsData[metricsData.metricName] = [metricsData];
        });
    },

    updateMemoryUtilization: function () {
      var that = this;
      return this.metricsModel.getMemoryUtilization(this.metricsModel.makeNodeNameFilter(this.nodeName))
        .then(function (metricsData) {
          that.metricsData[metricsData.metricName] = [metricsData];
        });
    },

    updateNetworkDataTransmitted: function () {
      var that = this;
      return this.metricsModel.updateNetworkDataTransmitted(this.metricsModel.makeNodeNameFilter(this.nodeName))
        .then(function (metricsData) {
          that.metricsData[metricsData.metricName] = [metricsData];
        });
    },

    updateNetworkDataReceived: function () {
      var that = this;
      return this.metricsModel.updateNetworkDataReceived(this.metricsModel.makeNodeNameFilter(this.nodeName))
        .then(function (metricsData) {
          that.metricsData[metricsData.metricName] = [metricsData];
        });
    },

    updateNodeUptime: function () {
      var that = this;
      this.metricsModel.getNodeUptime(this.nodeName)
        .then(function (uptime) {
          that.nodeUptime = that.utilsService.getSensibleTime(uptime);
        });
    },

    fetchLimitMetrics: function () {
      var that = this;
      var promises = [this.metricsModel.getNodeCpuLimit(this.nodeName),
        this.metricsModel.getNodeMemoryLimit(this.nodeName)];
      this.$q.all(promises).then(function (limits) {
        that.cpuLimit = limits[0];
        // Memory limit is in bytes, convert to Mb for the filter
        that.memoryLimit = parseInt(limits[1], 10) / (1024 * 1024);
      });
    },

    hasMetrics: function (metricName) {
      return _.has(this.metricsData, metricName) && _.first(this.metricsData[metricName]).dataPoints.length > 0;
    },

    namespaceDetails: function () {
      this.$state.go('metrics.dashboard.namespace.details', {nodeName: this.nodeName});
    }
  });

})();
