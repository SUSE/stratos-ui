(function () {
  'use strict';

  angular
    .module('service-manager.view.service.instance-detail', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {

    // Abstract detail route
    $stateProvider.state('sm.endpoint.instance', {
      url: '/instance/:id',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-detail.html',
      controller: ServiceManagerInstanceDetailController,
      controllerAs: 'instanceCtrl',
      abstract: true,
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      data: {
        activeMenuState: 'sm.list'
      }
    });

    // Services Tab
    $stateProvider.state('sm.endpoint.instance.services', {
      url: '',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-services.html',
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      data: {
        activeMenuState: 'sm.list'
      }
    });

    // Components Tab
    $stateProvider.state('sm.endpoint.instance.components', {
      url: '/components',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-components.html',
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      data: {
        activeMenuState: 'sm.list'
      }
    });

    // Parameters Tab
    $stateProvider.state('sm.endpoint.instance.parameters', {
      url: '/parameters',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-parameters.html',
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      data: {
        activeMenuState: 'sm.list'
      }
    });

    // Scaling Tab
    $stateProvider.state('sm.endpoint.instance.scaling', {
      url: '/scaling',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-scaling.html',
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      data: {
        activeMenuState: 'sm.list'
      }
    });

    // Upgrades Tab
    $stateProvider.state('sm.endpoint.instance.upgrades', {
      url: '/upgrades',
      templateUrl: 'plugins/service-manager/view/service/instance-detail/instance-upgrades.html',
      ncyBreadcrumb: {
        label: '{{ instanceCtrl.id || "..." }}',
        parent: 'sm.endpoint.detail.instances'
      },
      controller: UpgradeController,
      controllerAs: 'instanceUpgradeCtrl'
    });
  }

  ServiceManagerInstanceDetailController.$inject = [
    '$scope',
    '$timeout',
    '$stateParams',
    '$log',
    'app.utils.utilsService',
    '$state',
    '$q',
    'app.view.endpoints.clusters.cluster.rolesService',
    'app.model.modelManager',
    'helion.framework.widgets.dialog.confirm'
  ];

  function ServiceManagerInstanceDetailController($scope, $timeout, $stateParams, $log, utils, $state, $q, rolesService, modelManager, confirmDialog) {
    var that = this;

    this.initialized = false;
    this.guid = $stateParams.guid;
    this.userServiceInstanceModel = modelManager.retrieve('app.model.serviceInstance.user');
    this.confirmDialog = confirmDialog;
    this.$timeout = $timeout;

    this.hsmModel = modelManager.retrieve('service-manager.model');
    this.stackatoInfo = modelManager.retrieve('app.model.stackatoInfo');

    this.getEndpoint = function () {
      return utils.getClusterEndpoint(that.endpoint);
    };

    this.guid = $state.params.guid;
    this.id = $state.params.id;

    this.interestingState = false;

    this.actions = [
      { name: 'Upgrade Instance'},
      { name: 'Configure Instance'},
      { name: 'Delete Instance',
        execute: function () {
          return that.deleteInstance(that.id);
        }
      }
    ];

    this.highlight = function (id, on) {
      if (on) {
        angular.element('.hsm-volume-' + id).addClass('hilight');
      } else {
        angular.element('.hsm-volume-' + id).removeClass('hilight');
      }
    };

    // Poll for updates
    $scope.$on('$destroy', function () {
      that.$timeout.cancel(that.pollTimer);
    });

    this.fetch().then(function () {
      that.poll();
    });
  }

  angular.extend(ServiceManagerInstanceDetailController.prototype, {

    poll: function (fetchNow) {
      var that = this;
      if (that.deleted || that.notFound) {
        return;
      }

      // Cancel timer if one is outstanding
      if (this.pollTimer) {
        this.$timeout.cancel(this.pollTimer);
      }

      var pollTime = that.interestingState ? 2500 : 5000;
      pollTime = fetchNow ? 0 : pollTime;

      this.pollTimer = this.$timeout(function () {
        that.fetch().finally(function () {
          delete that.pollTimer;
          that.poll();
        });
      }, pollTime);
    },

    fetch: function () {
      var that = this;
      return this.hsmModel.getInstance(this.guid, this.id).then(function (data) {
        that.instance = data;
        that._setStateIndicator();
      }).catch(function (err) {
        if (that.deleting) {
          that.deleted = true;
          that.instance.state = 'deleted';
          that._setStateIndicator();
        } else if (err.status === 404) {
          that.notFound = true;
          that.instance = that.instance || {};
          that.instance.state = '404';
          that._setStateIndicator();
        }
      });
    },

    _setStateIndicator: function () {
      var that = this;
      that.interestingState = false;
      switch (this.instance.state) {
        case 'running':
          that.stateIndicator = 'ok';
          break;
        case 'creating':
          that.stateIndicator = 'busy';
          that.interestingState = true;
          break;
        case 'deleting':
          that.stateIndicator = 'busy';
          that.interestingState = true;
          break;
        case 'deleted':
          that.stateIndicator = 'tentative';
          break;
        case 'degraded':
          that.stateIndicator = 'warning';
          break;
        case '404':
          that.stateIndicator = 'error';
          break;
        default:
          that.stateIndicator = 'tentative';
      }
    },

    deleteInstance: function (id) {
      var that = this;
      var dialog = this.confirmDialog({
        title: gettext('Delete Instance'),
        description: function () {
          return 'Are you sure that you want to delete instance "' + id + '" ?';
        },
        moment: moment,
        buttonText: {
          yes: gettext('Delete'),
          no: 'Cancel'
        }
      });
      dialog.result.then(function () {
        that.hsmModel.deleteInstance(that.guid, id).then(function () {
          that.deleting = true;
          that.poll(true);
        });
      });
    }
  });

  UpgradeController.$inject = [
    '$state',
    'app.model.modelManager'
  ];

  function UpgradeController($state, modelManager) {
    var hsmModel = modelManager.retrieve('service-manager.model');
    hsmModel.clearUpgrades($state.params.guid);
  }

})();
