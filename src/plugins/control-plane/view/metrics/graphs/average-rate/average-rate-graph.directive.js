(function () {
  'use strict';

  angular
    .module('control-plane.view.metrics.dashboard')
    .directive('averageRateGraph', averageRateGraph);

  //averageRateGraph.$inject = ['app.basePath'];

  function averageRateGraph() {
    return {
      bindToController: {
        filter: '@',
        metric: '@',
        yLabel: '@',
        nodeName: '@'
      },
      controller: AverageRateGraphController,
      controllerAs: 'averageRateGraphCtrl',
      scope: {},
      templateUrl: 'plugins/control-plane/view/metrics/graphs/average-rate/average-rate-graph.html'
    };
  }

  AverageRateGraphController.$inject = [
    '$interval',
    '$scope',
    'app.model.modelManager',
    'app.utils.utilsService'
  ];

  function AverageRateGraphController($interval, $scope, modelManager, utilsService) {

    var that = this;

    this.metricsModel = modelManager.retrieve('cloud-foundry.model.metrics');
    this.utilsService = utilsService;

    // var interval = $interval(function () {
    //   that.updateUtilization();
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
          right: 60,
          bottom: 50,
          left: 20
        },
        useInteractiveGuideline: true,
        dispatch: {},
        xAxis: {
          axisLabel: null,
          tickFormat: this.utilsService.timeTickFormatter,
          margin: {
            right: 40
          }
        },
        yAxis: {
          axisLabel: this.yLabel,
          axisLabelDistance: -30,
          showMaxMin: false,
          orient: 'right',
          tickFormat: function (d) {
            return parseFloat(d).toFixed(1);
          },
          dispatch: {
            renderEnd: function () {
              var elementName = '#' + that.metric + '_' + that.utilsService.sanitizeString(that.nodeName);
              var selectedElement = d3.select(elementName + ' svg');
              if (selectedElement.length > 0 && selectedElement[0][0]) {
                var width = parseInt(selectedElement.style('width').replace(/px/, ''), 10) - 80;
                var yAxis = d3.select(elementName + ' svg .nv-y');
                yAxis.attr('transform', 'translate(' + width + ',0)');
              }

            }
          }
        },
        // yDomain: [0,100],
        showLegend: false,
        interpolate: 'basis'
      }
    };

    this.updateUtilization();

    this.chartApi = null;

    this.data = [{
      color: '#60799d',
      values: [],
      key: 'CPU Utilization'
    }, {
      color: '#60799d',
      values: [],
      key: 'Average'
    }];

  }

  angular.extend(AverageRateGraphController.prototype, {

    updateUtilization: function () {
      var that = this;
      this.options.chart.noData = 'Loading data ...';

      var movingAverage = [];

      function convertToPercentage(dataPoints) {
        var transformedDp = [];
        var average = _.mean(_.map(dataPoints, 'y'));
        var maxValue = _.max(_.map(dataPoints, 'y')) * 100;
        var minValue = _.min(_.map(dataPoints, 'y')) * 100;

        that.options.chart.yDomain = [minValue * 0.75, maxValue + 1.25];
        // average = average / dataPoints.length;
        average = (average * 100).toFixed(2);
        _.transform(dataPoints, function (result, dataPoint) {
          result.push(
            {
              x: dataPoint.x,
              y: (dataPoint.y * 100).toFixed(2)
            }
          );
          movingAverage.push({
            x: dataPoint.x,
            y: average
          });
          return true;
        }, transformedDp);
        return transformedDp;
      }

      return this.metricsModel.getMetrics(this.metric, this.filter)
        .then(function (metricsData) {
          that.data = [
            {
              color: '#60799d',
              values: convertToPercentage(metricsData.dataPoints),
              key: 'CPU Utilization'
            },
            {
              color: '#60799d',
              values: movingAverage,
              key: 'Average'
            }];
          that.chartApi.refresh();
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
