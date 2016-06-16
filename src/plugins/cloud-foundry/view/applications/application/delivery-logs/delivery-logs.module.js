(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-logs', [])
    .config(registerRoute);

  registerRoute.$inject = [
    '$stateProvider'
  ];

  function registerRoute($stateProvider) {
    $stateProvider.state('cf.applications.application.delivery-logs', {
      url: '/delivery-logs',
      templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/delivery-logs.html',
      controller: ApplicationDeliveryLogsController,
      controllerAs: 'appDelLogsCtrl'
    });
  }

  ApplicationDeliveryLogsController.$inject = [
    '$scope',
    '$stateParams',
    '$q',
    '$log',
    'moment',
    'app.model.modelManager',
    'helion.framework.widgets.detailView'
  ];

  /**
   * @name ApplicationDeliveryLogsController
   * @constructor
   * @param {object} $scope - the controller's $scope
   * @param {object} $stateParams - the UI router $stateParams service
   * @param {object} $interval - the angular $interval service
   * @param {object} $q - the angular $q service
   * @param {object} $log - the angular $log service
   * @param {object} moment - the moment timezone component
   * @param {app.model.modelManager} modelManager - the Model management service
   * @param {helion.framework.widgets.detailView} detailView - the helion framework detailView widget
   * @property {object} model - the Cloud Foundry Applications Model
   * @property {object} hceModel - the Code Engine Applications Model
   * @property {object} hasProject - true if a HCE project exists for this application, null if still determining
   * @property {object} last - contains the last successful build, test and deploy events
   * @property {string} id - the application GUID
   */
  function ApplicationDeliveryLogsController($scope, $stateParams, $q, $log, moment, modelManager, detailView) {
    this.model = modelManager.retrieve('cloud-foundry.model.application');
    this.hceModel = modelManager.retrieve('cloud-foundry.model.hce');
    this.cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    this.hceCnsi = {};
    this.hasProject = null;
    this.last = {};
    this.id = $stateParams.guid;
    // Pass through anything needed by prototype extend
    this.detailView = detailView;
    this.$q = $q;
    this.moment = moment;
    this.$log = $log;

    var that = this;
    var promise;

    /* eslint-disable */
    // TODO (rcox): Both vars + anything associated with to be removed once everything is wired in
    /* eslint-enable */
    this.addMock = 20;
    this.haveBackend = false;

    if (this.haveBackend) {
      /* eslint-disable */
      // TODO (kdomico): Hi! I've used the same github user approach. Update here as well or let me know if I need to do it
      // TODO (rcox): Improvements - Check if project id already exists in hce model?
      /* eslint-enable */
      promise = this.cnsiModel.list()
        .then(function () {
          var hceCnsis = _.filter(that.cnsiModel.serviceInstances, {cnsi_type: 'hce'}) || [];
          if (hceCnsis.length > 0) {
            that.hceCnsi = hceCnsis[0];
            return that.hceModel.getUserByGithubId(that.hceCnsi.guid, '18697775')
              .then(function() {
                return that.hceModel.getProjects(that.hceCnsi.guid)
                  .then(function() {
                    return that.hceModel.getProject(that.model.application.summary.name);
                  });
              })
              .catch(function(response) {
                if (response.status === 404) {
                  that.hceModel.createUser(that.hceCnsi.guid, '123456', 'login', 'token');
                }
              });
          } else {
            return $q.reject('No CNSI found');
          }
        });
    } else {
      promise = $q.when({});
    }

    promise
      .then(function (project) {
        that.hasProject = !(angular.isUndefined(project) || project === null);
        if (that.hasProject) {
          that.updateData();
        }
      })
      .catch(function () {
        that.hasProject = 'error';
      });

    that.execWatch = $scope.$watch(function() { return that.displayedExecutions; }, function(visibleExecutions) {
      that.updateVisibleExecutions(visibleExecutions);
    });

  }

  angular.extend(ApplicationDeliveryLogsController.prototype, {

    eventTypes: {
      // Required to determine 'Last Build|Last Test|Last Deploy' summary at top of page
      BUILDING: 'Building',
      TESTING: 'Testing',
      DEPLOYING: 'Deploying',
      // Require to know if the execution has finished (execution state is not trustworthy)
      WATCHDOG_TERMINATED: 'watchdog',
      PIPELINE_COMPLETED: 'pipeline_completed'
    },

    eventStates: {
      // Required to determine if the execution has succeeded|failed
      SUCCEEDED: 'succeeded',
      FAILED: 'failed',
      // Required to show that the execution is still running
      RUNNING: 'running'
    },

    triggerBuild: function() {
      /* eslint-disable */
      alert('TODO: trigger build');
      /* eslint-enable */
    },

    viewExecution: function(execution) {
      var that = this;
      var rawExecution = _.find(that.hceModel.data.pipelineExecutions, function(o) {
        return o.id === execution.id;
      });

      this.detailView({
        templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/details/execution.html',
        title: rawExecution.message
      }, {
        guid: that.hceCnsi.guid,
        execution: rawExecution,
        events: that.eventsPerExecution[execution.id],
        viewEvent: function(build) {
          that.viewEvent(build);
        }
      });
    },

    viewEventForExecution: function(execution) {
      var events = this.eventsPerExecution[execution.id];

      if (!events || events.length === 0) {
        return;
      }

      this.viewEvent(events[events.length - 1]);
    },

    viewEvent: function(event) {
      this.detailView({
        templateUrl: 'plugins/cloud-foundry/view/applications/application/delivery-logs/details/event.html',
        controller: 'eventDetailViewController',
        title: event.name
      }, {
        guid: this.hceCnsi.guid,
        event: event
      });
    },

    /**
     * @name ApplicationDeliveryLogsController.updateData
     * @description Fetch all execution and event data. Parse the output
     */
    updateData: function() {
      var that = this;

      that.eventsPerExecution = {};

      var promise;
      if (this.haveBackend) {
        var project = this.hceModel.getProject(this.model.application.summary.name);
        // Fetch pipeline executions
        promise = this.hceModel.getPipelineExecutions(that.hceCnsi.guid, project.id);
      } else {
        that.hceModel.data.pipelineExecutions = [];
        promise = this.$q.when();
      }
      if (this.addMock) {
        promise.then(function() {
          that.hceModel.data.pipelineExecutions = that.hceModel.data.pipelineExecutions.concat(that.createMockExecutions());
        });
      }

      promise
        .then(function() {
          // The ux will need to show additional properties. In order to not muddy the original model make a copy
          that.parsedHceModel = angular.fromJson(angular.toJson(that.hceModel.data));

          for (var i = 0; i < that.parsedHceModel.pipelineExecutions.length; i++) {
            var execution = that.parsedHceModel.pipelineExecutions[i];
            that.parseExecution(execution, that.eventsPerExecution[execution.id]);
          }
        })
        .catch(function(error) {
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
    fetchEvents: function(eventsPerExecution, executionId) {
      var that = this;
      // Reset the last successful build/test/deploy events
      this.last = { };

      var promise;
      if (this.haveBackend) {
        promise = that.hceModel.getPipelineEvents(that.hceCnsi.guid, executionId);
      } else if (this.addMock) {
        promise = this.$q.when(this.createMockEvents(executionId));
      } else {
        promise = this.$q.reject('No backend, no mock, therefor no events');
      }

      return promise
        .then(function(events) {
          for (var i = 0; i < events.length; i++) {
            that.parseEvent(events[i]);
          }
          events = _.orderBy(events, function(event) {
            return event.mEndDate ? event.mEndDate.unix() : Number.MAX_VALUE;
          }, 'asc');
          eventsPerExecution[executionId] = events;
        });
    },

    /**
     * @name ApplicationDeliveryLogsController.parseEvent
     * @description Update the event with the required information for the ux. This includes upfront momentising of
     * dates, calculating duration if missing, localising dates and labels, discovering the latest build/test/deploy
     * events, etc
     * @param {object} event - event to parse
     */
    parseEvent: function(event) {
      event.mEndDate = event.endDate ? moment(event.endDate) : undefined;

      if (!event.duration && (event.startDate && event.endDate)) {
        event.duration = moment(event.startDate).diff(event.endDate);
      }

      if (angular.isDefined(event.duration)) {
        event.durationString = moment.duration(event.duration, 'ms').humanize();
      } else {
        event.durationString = gettext('Unknown');
      }

      // Update event name such that they are set before the table filter is applied. Note the change in tense for
      // building, testing and deploying (we get these events after they've actually finished). It would be good to do
      // this directly in a language file, however these are auto generated.
      switch (event.type) {
        case this.eventTypes.BUILDING:
          event.name = gettext('Build');
          break;
        case this.eventTypes.TESTING:
          event.name = gettext('Test');
          break;
        case this.eventTypes.DEPLOYING:
          event.name = gettext('Deploy');
          break;
        case this.eventTypes.WATCHDOG_TERMINATED:
          event.name = gettext('Terminated');
          break;
        case this.eventTypes.PIPELINE_COMPLETED:
          event.name = gettext('Completed');
          break;
      }

      this.determineLatestEvent(event);
    },

    /**
     * @name ApplicationDeliveryLogsController.determineLatestEvent
     * @description Is this event the latest of it's type for this application? If so track it
     * @param {object} event - HCE event
     */
    determineLatestEvent: function(event) {
      var type = event.type.toLowerCase();
      if (!this.last[type] ||
        event.state === this.eventStates.SUCCEEDED && this.last[type].mEndDate.diff(event.mEndDate) < 0) {
        this.last[type] = event;
      }
    },

    /**
     * @name ApplicationDeliveryLogsController.parseExecution
     * @description Update the execution to contain the required information. Due to the way search works ensure all
     * dates and text is localised before it hits the scope
     * @param {object} execution - execution to update
     * @param {array} events - HCE events associated with the execution
     */
    parseExecution: function(execution, events) {
      // Used to sort items in table
      execution.reason.mCreatedDate = this.moment(execution.reason.createdDate);

      //The execution result is actually junk, need to look at the latest execution event and use that
      // as the execution result. Also required to update the result with translated text, which makes is searchable.
      if (!events || events.length === 0) {
        // Clear the result
        execution.result = undefined;
        return;
      }

      var event = events[events.length - 1];

      execution.result = {
        state: this.determineExecutionState(event),
        label: event.name,
        hasLog: event.artifact_id
      };
    },

    /**
     * @name ApplicationDeliveryLogsController.determineExecutionState
     * @description Determines the execution state from the last received event
     * @param {object} event - Last HCE event of an execution
     * @returns {string} - Updated execution state
     */
    determineExecutionState: function(event) {
      if (
        event.type === this.eventTypes.PIPELINE_COMPLETED ||
        event.type === this.eventTypes.WATCHDOG_TERMINATED ||
        event.state === this.eventStates.FAILED) {
        return event.state;
      } else {
        return this.eventStates.RUNNING;
      }
    },

    updateVisibleExecutions: function(visibleExecutions) {
      // Nothing visible? Nothing to update
      if (!visibleExecutions || visibleExecutions.length === 0) {
        return;
      }

      var that = this;

      // Run through each visible execution and fetch it's event (each is a separate call)
      var fetchEventsPromises = [];
      for (var i = 0; i < visibleExecutions.length; i++) {
        var execution = visibleExecutions[i];
        if (!that.eventsPerExecution[execution.id]) {
          fetchEventsPromises.push(that.fetchEvents(that.eventsPerExecution, execution.id));
        }
      }

      // Once all the events for every visible execution has completed parse those events to determine what the
      // execution's 'result' is.
      that.$q.all(fetchEventsPromises).then(function() {
        for (var i = 0; i < visibleExecutions.length; i++) {
          var execution = visibleExecutions[i];
          that.parseExecution(execution, that.eventsPerExecution[execution.id]);
        }

        // Also check that there are more events to fetch. If not then stop watching this collection
        var eventsStillToFetch = _.findIndex(that.parsedHceModel.pipelineExecutions, function(execution) {
          return angular.isUndefined(that.eventsPerExecution[execution.id]);
        });

        if (eventsStillToFetch < 0) {
          that.execWatch();
        }
      });
    },

    /* eslint-disable */
    // TODO (rcox): Remove all mock functions
    mockExecutions: 0,

    mockEvents: 0,

    randomString: function(length) {
      var text = "";
      var possible = "ABCDEFG HIJKLMN OPQRSTUV WXYZabcde fghi jklmn opqrstu vwxyz01 2345 6789 ";

      for (var i = 1; i < length; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

      return text;
    },

    randomNumber: function(min, max) {
      var result = Math.floor(Math.random() * (max - min + 1)) + min;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    createMockExecutions: function() {
      var that = this;

      function createRandomExecution() {
        var authors = [ 'DBaldwin', 'JAubrey', 'GNuman', 'BAtman', 'MAli', 'btat', 'richard-cox' ];
        var types = [ 'manual' ];
        var results = [ 'Failure'];
        return {
          concoursePipelineId: that.randomString(20),
          id: that.mockExecutions++,
          message: that.randomString(that.randomNumber(1, 100)),
          name: that.randomString(that.randomNumber(1, 10)),
          reason: {
            commitSha: that.randomString(20),
            author: authors[that.randomNumber(0, authors.length - 1)],
            createdDate: moment().subtract(that.randomNumber(1, 3000), 'seconds').format(),
            pullRequestId: null,
            type: types[that.randomNumber(0, types.length - 1)]
          },
          result: results[that.randomNumber(0, results.length - 1)]
        }
      }

      var result = [];
      for(var i=0; i<that.addMock; i++) {
        result.push(createRandomExecution());
      }
      return result;
    },

    createMockEvents: function(executionId) {
      function createEvent(id, type, state, startOffset, endOffset, artifactId) {
        return {
          id: id,
          name: type,
          type: type,
          state: state,
          startDate: moment().subtract(startOffset, 'seconds').format(),
          endDate: moment().subtract(endOffset, 'seconds').format(),
          artifact_id: artifactId,
          duration: (startOffset - endOffset) * 1000,
          execution_id: executionId
        };
      }

      var mod = executionId % 4;
      var states = [ this.eventStates.FAILED, this.eventStates.SUCCEEDED ];
      var terminatedStates = [ this.eventTypes.PIPELINE_COMPLETED, this.eventTypes.WATCHDOG_TERMINATED ];
      var startTime = this.randomNumber(1, 60000);


      var that = this;
      function iterateTime() {
        startTime = startTime - that.randomNumber(1, startTime);
        startTime = startTime > 0 ? startTime : 0;
        return startTime;
      }

      var events = [];
      if (mod === 3) {
        events.push(createEvent(this.mockEvents++, this.eventTypes.BUILDING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        events.push(createEvent(this.mockEvents++, this.eventTypes.DEPLOYING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        events.push(createEvent(this.mockEvents++, this.eventTypes.TESTING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        var terminatedState = terminatedStates[this.randomNumber(0, terminatedStates.length -1)];
        var state = terminatedState === this.eventTypes.WATCHDOG_TERMINATED ? this.eventStates.FAILED : states[this.randomNumber(0, states.length-1)]
        events.push(createEvent(this.mockEvents++, terminatedState, state, startTime, iterateTime(), 1));
      }
      if (mod === 2) {
        events.push(createEvent(this.mockEvents++, this.eventTypes.BUILDING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        events.push(createEvent(this.mockEvents++, this.eventTypes.DEPLOYING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        events.push(createEvent(this.mockEvents++, this.eventTypes.TESTING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
      }
      if (mod === 1) {
        events.push(createEvent(this.mockEvents++, this.eventTypes.BUILDING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
        events.push(createEvent(this.mockEvents++, this.eventTypes.DEPLOYING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
      }
      if (mod === 0) {
        events.push(createEvent(this.mockEvents++, this.eventTypes.BUILDING, this.eventStates.SUCCEEDED, startTime, iterateTime(), 1));
      }

      return events;
    }
    /* eslint-enable */
  });

})();
