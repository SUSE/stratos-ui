(function () {
  'use strict';

  angular
    .module('code-engine.view.application.delivery-logs', [])
    .config(registerRoute)
    .run(registerAppTab);

  function registerRoute($stateProvider) {
    // $stateProvider.state('ce.application.delivery-logs', {
    $stateProvider.state('cf.applications.application.delivery-logs', {
      url: '/delivery-logs',
      templateUrl: 'plugins/code-engine/view/application/delivery-logs/delivery-logs.html',
      controller: ApplicationDeliveryLogsController,
      controllerAs: 'appDelLogsCtrl'
    });
  }

  function registerAppTab($stateParams, cfApplicationTabs, modelManager) {
    var canEditApp;
    cfApplicationTabs.tabs.push({
      position: 5,
      hide: function () {
        var model = modelManager.retrieve('cloud-foundry.model.application');
        if (!model.application.summary.space_guid) {
          return true;
        }
        if (angular.isUndefined(canEditApp)) {
          var cnsiGuid = $stateParams.cnsiGuid;
          var authModel = modelManager.retrieve('cloud-foundry.model.auth');

          canEditApp = authModel.isAllowed(cnsiGuid,
            authModel.resources.application,
            authModel.actions.update,
            model.application.summary.space_guid
          );
        }
        return !canEditApp;
      },
      uiSref: 'cf.applications.application.delivery-logs',
      label: 'app.tabs.deliveryLogs.label',
      clearState: function () {
        canEditApp = undefined;
      }
    });
  }

  /**
   * @name ApplicationDeliveryLogsController
   * @constructor
   * @param {object} $scope - the controller's $scope
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $q - the angular $q service
   * @param {object} $log - the angular $log service
   * @param {object} moment - the moment timezone component
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {ceEventDetailView} ceEventDetailView - show event details slide out
   * @param {ceExecutionDetailView} ceExecutionDetailView - show execution details slide out
   * @param {ceTriggerBuildDetailView} ceTriggerBuildDetailView - show trigger builds slide out
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {object} hceModel - the Code Engine Applications Model
   * @property {object} hasProject - true if a HCE project exists for this application, null if still determining
   * @property {object} last - contains the last successful build, test and deploy events
   * @property {string} id - the application GUID
   */
  function ApplicationDeliveryLogsController($scope, $stateParams, $q, $log, moment, modelManager, ceEventDetailView,
                                             ceExecutionDetailView, ceTriggerBuildDetailView) {
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.hceModel = modelManager.retrieve('code-engine.model.hce');
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.hasProject = false;
    this.last = {};
    this.id = $stateParams.guid;
    // Pass through anything needed by prototype extend
    this.views = {
      ceEventDetailView: ceEventDetailView,
      ceExecutionDetailView: ceExecutionDetailView,
      ceTriggerBuildDetailView: ceTriggerBuildDetailView
    };
    this.$q = $q;
    this.moment = moment;
    this.$log = $log;
    this.$scope = $scope;

    var that = this;

    this.$scope.$watch(function () {
      return !that.model.application.pipeline.fetching &&
        that.model.application.pipeline.valid &&
        that.model.application.pipeline.hce_api_url &&
        that.model.application.project !== null;
    }, function () {
      var pipeline = that.model.application.pipeline;
      that.hasProject = !!(pipeline && pipeline.valid && pipeline.hceCnsi && that.model.application.project);
      if (that.hasProject) {
        that.updateData();
      }
    });

    var projectWatch = this.$scope.$watch(function () {
      return that.model.application.project;
    }, function (newProject, oldProject) {
      if (oldProject && newProject && newProject.id === oldProject.id) {
        that.fetchExecutions().then(function () {
          that.updateVisibleExecutions(that.displayedExecutions);
        });
      }
    });

    that.debouncedUpdateVisibleExecutions = _.debounce(function (visibleExecutions) {
      that.updateVisibleExecutions(visibleExecutions);
    }, 500);

    $scope.$on('$destroy', function () {
      if (that.debouncedUpdateVisibleExecutions) {
        that.debouncedUpdateVisibleExecutions.cancel();
      }

      projectWatch();
    });
  }

  angular.extend(ApplicationDeliveryLogsController.prototype, {

    eventTypes: {
      // Required to determine 'Last Build|Last Test|Last Deploy' summary at top of page
      BUILDING: 'buildingstarted',
      BUILT: 'building',
      TESTING: 'testingstarted',
      TESTED: 'testing',
      DEPLOYING: 'deployingstarted',
      DEPLOYED: 'deploying',
      // Require to know if the execution has finished (execution state is not trustworthy)
      WATCHDOG_TERMINATED: 'watchdog',
      PIPELINE_COMPLETED: 'pipelinecompleted'
    },

    eventStates: {
      // Required to determine if the execution has succeeded|failed
      SUCCEEDED: 'succeeded',
      FAILED: 'failed',
      // Required to show that the execution is still running
      RUNNING: 'running'
    },

    triggerBuild: function () {
      var that = this;
      var pipeline = that.model.application.pipeline;
      this.views.ceTriggerBuildDetailView.open(this.model.application.project, pipeline.hceCnsi.guid).then(function () {
        that.updateData();
      });
    },

    viewExecution: function (execution) {
      var that = this;
      var rawExecution = _.find(this.hceModel.data.pipelineExecutions, function (o) {
        return o.id === execution.id;
      });

      var pipeline = that.model.application.pipeline;

      // Do not show the 'started' style events and 'completed' event
      var filteredEvents = _.filter(this.eventsPerExecution[execution.id], function (event) {
        return event.type !== that.eventTypes.BUILDING &&
          event.type !== that.eventTypes.TESTING &&
          event.type !== that.eventTypes.DEPLOYING &&
          event.type !== that.eventTypes.PIPELINE_COMPLETED;
      });

      this.views.ceExecutionDetailView.open(rawExecution, filteredEvents, pipeline.hceCnsi.guid);
    },

    viewEventForExecution: function (execution) {
      var events = this.eventsPerExecution[execution.id];

      if (!events || events.length === 0) {
        return;
      }

      var pipeline = that.model.application.pipeline;
      this.views.ceEventDetailView.open(events[events.length - 1], pipeline.hceCnsi.guid);
    },

    /**
     * @name ApplicationDeliveryLogsController.updateData
     * @description Fetch all execution and event data. Parse the output
     */
    updateData: function () {
      var that = this;

      // Reset/init the locally cached events and start watching the visible executions (only events for executions that
      // are visible will be fetched)
      that.eventsPerExecution = {};
      // Watch the visible executions. This will internally stop watching if all executions have had their events
      // fetched. Also debounce the execution to avoid initialisation flip flop
      if (that.execWatch) {
        that.execWatch();
      }
      that.execWatch = that.$scope.$watch(function () {
        return that.displayedExecutions;
      }, that.debouncedUpdateVisibleExecutions);

      this.fetchExecutions();
    },

    fetchExecutions: function () {
      var that = this;
      var pipeline = this.model.application.pipeline;
      var projectId = this.model.application.project.id;

      return this.hceModel.getPipelineExecutions(pipeline.hceCnsi.guid, projectId)
        .then(function () {
          // The ux will need to show additional properties. In order to not muddy the original model make a copy
          that.parsedHceModel = angular.fromJson(angular.toJson(that.hceModel.data));

          for (var i = 0; i < that.parsedHceModel.pipelineExecutions.length; i++) {
            var execution = that.parsedHceModel.pipelineExecutions[i];
            that.parseExecution(execution, that.eventsPerExecution[execution.id]);
          }
        })
        .catch(function (error) {
          that.$log.error('Failed to fetch/process pipeline executions or events: ', error);
        });
    },

    /**
     * @name ApplicationDeliveryLogsController.fetchEvents
     * @description For the given execution find all related events. Also sort events in time order and parse
     * @param {object} eventsPerExecution - execution id : events name:key object
     * @param {string} executionId - id of execution
     * @returns {object} promise to use for completion notification
     */
    fetchEvents: function (eventsPerExecution, executionId) {
      var that = this;
      var pipeline = that.model.application.pipeline;

      // Fetch events
      return that.hceModel.getPipelineEvents(pipeline.hceCnsi.guid, executionId)
        .then(function (events) {
          for (var i = 0; i < events.length; i++) {
            that.parseEvent(events[i]);
          }
          events = _.orderBy(events, 'id', 'asc');
          eventsPerExecution[executionId] = events;
        });
    },

    /* eslint-disable complexity */
    // NOTE - Complexity of 13, left in to improve readability.
    /**
     * @name ApplicationDeliveryLogsController.parseEvent
     * @description Update the event with the required information for the ux. This includes upfront momentising of
     * dates, calculating duration if missing, localising dates and labels, discovering the latest build/test/deploy
     * events, etc
     * @param {object} event - event to parse
     */
    parseEvent: function (event) {
      event.mEndDate = event.end_date ? moment(event.end_date) : undefined;

      if (!event.duration && (event.start_date && event.end_date)) {
        // Duration should be a positive integer
        event.duration = moment(event.end_date).diff(event.start_date);
      }

      if (angular.isDefined(event.duration)) {
        // We're not interested in showing time to the ms, so 'round' to nearest second
        if (event.duration < 1000) {
          event.durationString = gettext('Less than a second');
        } else {
          event.durationString = moment.duration(event.duration, 'ms').format('h[h] m[m] s[s]');
        }
      } else {
        event.durationString = gettext('Unknown');
      }

      // This is used as a key in a number of places. Sanitise to make viable.
      event.type = _.replace(event.type, ' ', '').toLowerCase();

      // The event name needs to be massaged into two forms
      // - event.name will be the title and used without tense. this is used in slide outs and their titles
      // - event.resultLabel will be the value shown in the main executions table as the 'status' and should show tense
      // It would be good to do this directly in a language file, however these are auto generated.
      switch (event.type) {
        case this.eventTypes.BUILDING:
          event.name = gettext('Building');
          break;
        case this.eventTypes.BUILT:
          event.name = gettext('Build');
          event.resultLabel = gettext('Built');
          break;
        case this.eventTypes.TESTING:
          event.name = gettext('Testing');
          break;
        case this.eventTypes.TESTED:
          event.name = gettext('Test');
          event.resultLabel = gettext('Tested');
          break;
        case this.eventTypes.DEPLOYING:
          event.name = gettext('Deploying');
          break;
        case this.eventTypes.DEPLOYED:
          event.name = gettext('Deploy');
          event.resultLabel = gettext('Deployed');
          break;
        case this.eventTypes.WATCHDOG_TERMINATED:
          event.name = gettext('Terminated');
          break;
        case this.eventTypes.PIPELINE_COMPLETED:
          event.name = gettext('Completed');
          break;
      }
      event.resultLabel = event.resultLabel || event.name;

      this.determineLatestEvent(event);
    },
    /* eslint-enable complexity */

    /**
     * @name ApplicationDeliveryLogsController.determineLatestEvent
     * @description Is this event the latest of it's type for this application? If so track it
     * @param {object} event - HCE event
     */
    determineLatestEvent: function (event) {
      var type = event.type;
      if (!this.last[type] ||
        event.state === this.eventStates.SUCCEEDED && event.id > this.last[type].id) {
        this.last[type] = event;
      }
    },

    /**
     * @name ApplicationDeliveryLogsController.parseExecution
     * @description Update the execution to contain the required information. Due to the way search works ensure all
     * dates and text is localised before it hits the scope
     * @param {object} execution - execution to update
     * @param {Array} events - HCE events associated with the execution
     */
    parseExecution: function (execution, events) {
      // Used to sort items in table
      execution.reason.mCreatedDate = this.moment(execution.reason.created_date);

      //The execution result is actually junk, need to look at the latest execution event and use that
      // as the execution result. Also required to update the result with translated text, which makes is searchable.
      if (!events || events.length === 0) {
        // Clear the result
        execution.result = undefined;
        return;
      }

      var event = events[events.length - 1];

      execution.result = this.determineExecutionResult(event);
    },

    /**
     * @name ApplicationDeliveryLogsController.determineExecutionResult
     * @description Determines the execution result from the last received event
     * @param {object} event - Last HCE event of an execution
     * @returns {object} - Content required by UX to display the execution result
     */
    determineExecutionResult: function (event) {
      var hasCompleted =
        event.type === this.eventTypes.PIPELINE_COMPLETED ||
        event.type === this.eventTypes.WATCHDOG_TERMINATED ||
        event.state === this.eventStates.FAILED;

      var result = {
        completed: hasCompleted,
        state: hasCompleted ? event.state : this.eventStates.RUNNING,
        label: event.resultLabel
      };

      // Override the label for this specific case. This is the real 'result' of the execution
      if (event.type === this.eventTypes.PIPELINE_COMPLETED) {
        result.label = event.state === this.eventStates.SUCCEEDED ? gettext('Success') : gettext('Failed');
      }

      return result;
    },

    /**
     * @name ApplicationDeliveryLogsController.updateVisibleExecutions
     * @description Only some executions are visible. For thos visible executions fetch their associated events. If
     * all executions have their events stop watching the visibileExecutions collection
     * @param {Array} visibleExecutions - List of executions that are visible to the user
     */
    updateVisibleExecutions: function (visibleExecutions) {
      // Nothing visible? Nothing to update
      if (!visibleExecutions || visibleExecutions.length === 0) {
        return;
      }

      var that = this;

      // Run through each visible execution and fetch it's event (each is a separate call)
      var fetchEventsPromises = [];
      for (var i = 0; i < visibleExecutions.length; i++) {
        var execution = visibleExecutions[i];
        if (!that.eventsPerExecution[execution.id] || !execution.result || !execution.result.completed) {
          fetchEventsPromises.push(that.fetchEvents(that.eventsPerExecution, execution.id));
        }
      }

      if (fetchEventsPromises.length < 1) {
        return;
      }

      // Once all the events for every visible execution has completed parse those events to determine what the
      // execution's 'result' is.
      that.$q.all(fetchEventsPromises).then(function () {
        for (var i = 0; i < visibleExecutions.length; i++) {
          var execution = visibleExecutions[i];
          that.parseExecution(execution, that.eventsPerExecution[execution.id]);
        }

        // Also check that there are more events to fetch. If not then stop watching this collection
        var eventsStillToFetch = _.findIndex(that.parsedHceModel.pipelineExecutions, function (execution) {
          return angular.isUndefined(that.eventsPerExecution[execution.id]);
        });

        if (eventsStillToFetch < 0) {
          that.execWatch();
        }
      });
    }

  });

})();
