(function () {
  'use strict';

  angular
    .module('app.view.metrics')
    .directive('cumulativeChart', cumulativeChart);

  cumulativeChart.$inject = ['app.basePath'];

  function cumulativeChart(path) {
    return {
      bindToController: {
        filter: '@',
        metric: '@',
        yLabel: '@',
        nodeName: '@',
        metricLimit: '@'
      },
      controller: CumulativeChartController,
      controllerAs: 'cumulativeChartCtrl',
      scope: {},
      templateUrl: path + 'view/metrics/graphs/cumulative/cumulative-graph.html'
    };
  }

  CumulativeChartController.$inject = [
    '$interval',
    '$state',
    '$scope',
    '$q',
    'app.model.modelManager',
    'app.utils.utilsService'
  ];

  function CumulativeChartController($interval, $state, $scope, $q, modelManager, utilsService) {

    var that = this;

    this.metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');

    this.metricData = {};
    this.updateChart();

    var interval = $interval(function () {
      that.updateChart();
    }, 60000);

    $scope.$on('$destroy', function () {
      $interval.cancel(interval);
    });

    this.options = {
      chart: {
        type: 'lineChart',
        height: 200,
        margin: {
          top: 20,
          right: 65,
          bottom: 50,
          left: 20
        },
        color: [
          '#60799d'
        ],
        showLegend: false,
        duration: 300,
        isArea:true,
        useInteractiveGuideline: true,
        clipVoronoi: false,
        y: function (d) {
          return d.y;
        },
        xAxis: {
          axisLabel: '',
          tickFormat: function (d) {
            var duration = Math.floor(moment.duration(moment().diff(moment(d * 1000))).asHours());
            if (duration === 0) {
              return 'NOW';
            }
            return duration + 'HR';
          },
          showMaxMin: false,
          staggerLabels: true
        },
        yAxis: {
          axisLabel: this.yLabel,
          axisLabelDistance: 0,
          orient: 'right',
          tickFormat: function (y) {

            var mbData = y / (1024 * 1024);
            var gbData = y / (1024 * 1024 * 1024);

            if (mbData > 1000) {
              // When its GBs set line per GB
              return gbData.toFixed(2) + ' GB';
            } else {
              return mbData.toFixed(0) + ' MB';
            }
          },
          dispatch: {
            renderEnd: function () {
              var id = '#' + that.metric + '_' + that.nodeName + '_cchart';
              var selectedElement = d3.select(id + ' svg');
              if (selectedElement) {
                var width = parseInt(selectedElement.style('width').replace(/px/, '')) - 80;
                var yAxis = d3.select(id + ' svg .nv-y');
                yAxis.attr('transform', 'translate(' + width + ',0)');
              }

            }
          }
        },
      }
    };

    this.chartApi;

    this.data = [
      {
        values: [],
        label: 'UTILIZED',
        color: '#60798D'
      }
    ];

  }

  angular.extend(CumulativeChartController.prototype, {

    updateChart: function () {
      var that = this;

      return this.metricsModel.getMetrics(this.metric, '{' + this.filter + '}')
        .then(function (metricsData) {
          that.data = [
            {
              values: metricsData.dataPoints,
              label: 'Data Transmitted',
              color: '#60798D'
            }];

        });
    }

  });

})();
