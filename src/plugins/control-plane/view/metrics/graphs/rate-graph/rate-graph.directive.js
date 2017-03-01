(function () {
  'use strict';

  angular
    .module('control-plane.view.metrics.dashboard')
    .directive('rateGraph', rateGraph);

  rateGraph.$inject = ['app.basePath'];

  function rateGraph(path) {
    return {
      bindToController: {
        filter: '@',
        metric: '@',
        yLabel: '@',
        nodeName: '@',
        metricLimit: '@'
      },
      controller: RateChartController,
      controllerAs: 'rateChartCtrl',
      scope: {},
      templateUrl: 'plugins/control-plane/view/metrics/graphs/rate-graph/rate-graph.html'
    };
  }

  RateChartController.$inject = [
    '$interval',
    '$scope',
    'app.model.modelManager',
    'app.utils.utilsService'
  ];

  function RateChartController($interval, $scope, modelManager, utilsService) {

    var that = this;

    this.metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');
    this.utilsService = utilsService;

    this.metricData = {};

    // var interval = $interval(function () {
    //   that.updateChart();
    // }, 120000);
    //
    // $scope.$on('$destroy', function () {
    //   $interval.cancel(interval);
    // });

    this.options = {
      chart: {
        type: 'lineChart',
        height: 200,
        margin: {
          top: 20,
          right: 85,
          bottom: 50,
          left: 20
        },
        color: [
          '#60799d'
        ],
        showLegend: false,
        duration: 300,
        isArea: true,
        useInteractiveGuideline: true,
        clipVoronoi: false,
        y: function (d) {
          return d.y;
        },
        xAxis: {
          axisLabel: '',
          tickFormat: this.utilsService.timeTickFormatter,
          showMaxMin: true,
          staggerLabels: true
        },
        // yDomain:[0,100],
        yAxis: {
          axisLabel: this.yLabel,
          axisLabelDistance: 0,
          orient: 'right',
          showMaxMin: false,
          tickFormat: function (y) {

            var kbData = y / (1024);
            var mbData = y / (1024 * 1024);

            if (kbData > 1000) {
              return mbData.toFixed(1) + ' Mb/s';
            } else {
              return kbData.toFixed(0) + ' Kb/s';
            }
          },
          dispatch: {
            renderEnd: function () {
              var id = '#' + that.metric + '_' + that.getNodeName() + '_cchart';
              var selectedElement = d3.select(id + ' svg');
              if (selectedElement.length > 0 && selectedElement[0][0]) {
                var width = parseInt(selectedElement.style('width').replace(/px/, ''), 10) - 105;
                var yAxis = d3.select(id + ' svg .nv-y');
                yAxis.attr('transform', 'translate(' + width + ',0)');
              }

            }
          }
        }
      }
    };

    this.updateChart();

    this.chartApi = null;

    this.data = [
      {
        values: [],
        label: 'UTILIZED',
        color: '#60798D'
      }
    ];

  }

  angular.extend(RateChartController.prototype, {

    getNodeName: function () {

      if (this.nodeName === '*') {
        return 'all';
      } else {
        return this.utilsService.sanitizeString(this.nodeName);
      }
    },

    updateChart: function () {
      var that = this;
      this.options.chart.noData = 'Loading data ...';

      return this.metricsModel.getMetrics(this.metric, this.filter)
        .then(function (metricsData) {
          that.data = [
            {
              values: metricsData.dataPoints,
              label: 'Data Transmitted',
              color: '#60798D'
            }];
        }).catch(function () {
          that.options.chart.noData = 'No data available';
          that.data = [];
          if (that.chartApi) {
            that.chartApi.refresh();
          }
        });
    }

  });

})();
