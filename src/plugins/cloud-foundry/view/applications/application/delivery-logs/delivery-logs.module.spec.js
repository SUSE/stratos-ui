(function () {
  'use strict';

  describe('Deliver Logs', function () {

    var controller, $stateParams, $q, $log, moment, $state, $rootScope, detailView, hceModel, cnsiModel, modelManager,
      $httpBackend;

    beforeEach(module('green-box-console'));
    beforeEach(module('cloud-foundry.view.applications.application.delivery-logs'));

    // Define some common properties used throughout tests
    var application = {
      summary: {
        name: 'appName'
      }
    };
    var cnsi = { guid: 1234, name: 'appName', url:' cluster2_url', cnsi_type: 'hce' };
    var cnsiList = [cnsi];
    var project = {name: application.summary.name, id: '4321'};
    var projects = {};
    projects[project.name] = [project];

    function fakeModelCall(obj, func, reject, result, applyResultToProp) {
      // There's a number of places where we intercept requests to 'model' objects and supply out own response/data.
      // This could have called the actual models and then interceppted the http requests... however wanted to make
      // this test as independent as possible from anything going on in model land.
      spyOn(obj, func).and.callFake(function() {
        if (reject) {
          return $q.reject({ status: reject});
        }
        if (applyResultToProp) {
          _.set(obj, applyResultToProp, result);
        }

        return $q.when(result);
      });
    }

    beforeEach(inject(function (_$stateParams_, _$q_, _$log_, _moment_, $injector, _$state_, _$rootScope_) {
      // Create the parameters required by the ctor
      $stateParams = _$stateParams_;
      $q = _$q_;
      $log = _$log_;
      moment = _moment_;
      modelManager = $injector.get('app.model.modelManager');
      detailView = jasmine.createSpyObj('detailView', ['close', 'dismiss']);

      // Some generic vars needed in tests
      $state = _$state_;
      $rootScope = _$rootScope_;
      $httpBackend = $injector.get('$httpBackend');

      // Store the model functions that the constructor calls out to. These functions will be monitored and overwritten
      var model = modelManager.retrieve('cloud-foundry.model.application');
      _.set(model, 'application', application);
      hceModel = modelManager.retrieve('cloud-foundry.model.hce');
      cnsiModel = modelManager.retrieve('app.model.serviceInstance');
    }));

    function createController(ignoreRes) {
      // The controller can only be created after model override is defined, so create it separately on demand
      if (ignoreRes) {
        fakeModelCall(cnsiModel, 'list', 500);
      }

      var ApplicationDeliveryLogsController = $state.get('cf.applications.application.delivery-logs').controller;
      controller = new ApplicationDeliveryLogsController($rootScope.$new(), $stateParams, $q, $log, moment, modelManager, detailView);

      expect(controller).toBeDefined();
    }

    afterEach(function() {
      // Not necessarily needed, but will catch any requests that have not been overwritten.
      $httpBackend.verifyNoOutstandingExpectation();
      $httpBackend.verifyNoOutstandingRequest();
    });

    describe('Ctor', function() {
      it('Initial state', function() {
        fakeModelCall(cnsiModel, 'list', true, 'serviceInstances');

        createController();

        expect(controller.model).not.toBeNull();
        expect(controller.hceModel).not.toBeNull();
        expect(controller.cnsiModel).not.toBeNull();
        expect(controller.hceCnsi).not.toBeNull();
        expect(controller.hasProject).toBeNull();
        expect(controller.last).not.toBeNull();
        expect(controller.id).not.toBeNull();
      });

      it('Ctor fails, CNIS request fails', function() {
        fakeModelCall(cnsiModel, 'list', 500);

        createController();
        $rootScope.$apply();

        expect(cnsiModel.list).toHaveBeenCalled();
        expect(controller.hasProject).toEqual('error');
      });

      it('Ctor fails at no CNSI List', function() {
        fakeModelCall(cnsiModel, 'list', false, [], 'serviceInstances');

        createController();
        $rootScope.$apply();

        expect(cnsiModel.list).toHaveBeenCalled();
        expect(controller.hasProject).toEqual('error');
      });

      it('Ctor fails at no github user', function() {
        fakeModelCall(cnsiModel, 'list', false, cnsiList, 'serviceInstances');
        fakeModelCall(hceModel, 'getUserByGithubId', 404);
        fakeModelCall(hceModel, 'createUser', false, {});

        createController();
        $rootScope.$apply();

        expect(hceModel.createUser).toHaveBeenCalled();
        expect(controller.hceCnsi).toEqual(cnsiList[0]);
        // This should really be 'error', but the 'create if not found' process will be re-worked at some point soon.
        expect(controller.hasProject).toEqual(false);
      });

      it('Ctor fails at get projects', function() {
        fakeModelCall(cnsiModel, 'list', false, cnsiList, 'serviceInstances');
        fakeModelCall(hceModel, 'getUserByGithubId', false);
        fakeModelCall(hceModel, 'createUser', false, {});
        fakeModelCall(hceModel, 'getProjects', 500);

        createController();
        $rootScope.$apply();

        expect(hceModel.getUserByGithubId.calls.argsFor(0).length).toBe(2);
        expect(hceModel.getUserByGithubId.calls.argsFor(0)[0]).toEqual(cnsi.guid);
        expect(hceModel.getProjects).toHaveBeenCalled();
        expect(controller.hasProject).toEqual('error');
      });

      it('Ctor fails at no projects', function() {
        fakeModelCall(cnsiModel, 'list', false, cnsiList, 'serviceInstances');
        fakeModelCall(hceModel, 'getUserByGithubId', false);
        fakeModelCall(hceModel, 'createUser', false, {});
        fakeModelCall(hceModel, 'getProjects', false, {}, 'data.projects');

        createController();
        $rootScope.$apply();

        expect(hceModel.getProjects).toHaveBeenCalled();
        expect(controller.hasProject).toBe(false);
      });

      it('Ctor succeeds!', function() {
        fakeModelCall(cnsiModel, 'list', false, cnsiList, 'serviceInstances');
        fakeModelCall(hceModel, 'getUserByGithubId', false);
        fakeModelCall(hceModel, 'createUser', false, {});
        fakeModelCall(hceModel, 'getProjects', false, projects, 'data.projects');
        // Not part of ctor, fail to avoid http requests
        fakeModelCall(hceModel, 'getPipelineExecutions', 500);

        createController();

        $rootScope.$apply();

        expect(controller.hasProject).toBe(true);
      });

    });

    describe('Trigger Build', function() {
      beforeEach(function() {
        createController(true);
        _.set(controller, 'hceCnsi.guid', cnsi.guid);
        _.set(controller, 'project', project);
      });

      it('Shows detail view - success', function() {
        // Spy on the required functions to be called as a result of trigger
        spyOn(controller, 'detailView').and.callFake(function() {
          return {
            result: $q.when()
          };
        });
        spyOn(controller, 'updateData');

        controller.triggerBuild();
        $rootScope.$apply();

        expect(controller.detailView).toHaveBeenCalled();
        expect(controller.detailView.calls.argsFor(0).length).toBe(2);
        expect(controller.detailView.calls.argsFor(0)[1]).toEqual({
          guid: cnsi.guid,
          project: project
        });
        expect(controller.updateData).toHaveBeenCalled();
      });

      it('Shows detail view - failure', function() {
        // Spy on the required functions to be called as a result of trigger
        spyOn(controller, 'detailView').and.callFake(function() {
          return {
            result: $q.reject()
          };
        });
        spyOn(controller, 'updateData');

        controller.triggerBuild();
        $rootScope.$apply();

        expect(controller.detailView).toHaveBeenCalled();
        expect(controller.updateData).not.toHaveBeenCalled();
      });
    });

    describe('View Execution', function() {
      var execution = {id: 'two' };
      var rawExecution = {id: 'two', junkParam: true};
      var executions = [{id: 'one'}, rawExecution];
      var events = [
        {
          event: '3'
        }
      ];

      var eventsPerExecution = {
        one: [
          {
            event: '1'
          },
          {
            event: '2'
          }
        ],
        two: events
      };

      beforeEach(function() {
        createController(true);
        _.set(controller, 'hceCnsi.guid', cnsi.guid);
        _.set(controller, 'hceModel.data.pipelineExecutions', executions);
        _.set(controller, 'eventsPerExecution', eventsPerExecution);
      });

      it('Shows detail view', function() {
        // Spy on the required functions to be called as a result of trigger
        spyOn(controller, 'detailView');
        spyOn(controller, 'viewEvent');

        controller.viewExecution(execution);
        $rootScope.$apply();

        expect(controller.detailView).toHaveBeenCalled();
        expect(controller.detailView.calls.argsFor(0).length).toBe(2);
        var context = controller.detailView.calls.argsFor(0)[1];
        expect(context.guid).toEqual(cnsi.guid);
        expect(context.execution).toEqual(rawExecution);
        expect(context.events).toEqual(events);
      });

    });

    describe('View Event', function() {

      var event = {
        event: '1',
        name: 'name'
      };
      beforeEach(function() {
        createController(true);
        _.set(controller, 'hceCnsi.guid', cnsi.guid);
      });

      it('View event', function() {
        spyOn(controller, 'detailView');

        controller.viewEvent(event);
        $rootScope.$apply();

        expect(controller.detailView).toHaveBeenCalled();
        expect(controller.detailView.calls.argsFor(0).length).toBe(2);
        expect(controller.detailView.calls.argsFor(0)[0].title).toEqual(event.name);
        expect(controller.detailView.calls.argsFor(0)[1]).toEqual({
          guid: cnsi.guid,
          event: event
        });
      });
    });

    describe('Fetching events', function() {

      var event1 = {
        some: 'value1'
      };
      var event2 = {
        some: 'value2'
      };
      var eventsPerExecution = {};
      var executionId = '1';

      beforeEach(function() {
        createController(true);
        _.set(controller, 'hceCnsi.guid', cnsi.guid);
      });

      afterEach(function() {
        expect(hceModel.getPipelineEvents).toHaveBeenCalled();
        expect(hceModel.getPipelineEvents.calls.argsFor(0)).toBeDefined();
        expect(hceModel.getPipelineEvents.calls.argsFor(0).length).toBe(2);
        expect(hceModel.getPipelineEvents.calls.argsFor(0)[0]).toEqual(cnsi.guid);
        expect(hceModel.getPipelineEvents.calls.argsFor(0)[1]).toEqual(executionId);
      });

      it('Failed call', function() {
        fakeModelCall(hceModel, 'getPipelineEvents', 500);

        controller.fetchEvents({}, executionId).then(function() {
          fail('Fetch should not have succeeded');
        });
      });

      it('Empty call', function() {
        fakeModelCall(hceModel, 'getPipelineEvents', false, [event1]);
        spyOn(controller, 'parseEvent');

        controller.fetchEvents(eventsPerExecution, executionId).then(function() {
          expect(eventsPerExecution[executionId]).toEqual([event1]);
          expect(controller.parseEvent).toHaveBeenCalledWith(event1);
        }).catch(function() {
          fail('Fetch should not have failed');
        });

      });

      it('Some events', function() {
        var events = [event1, event2];

        fakeModelCall(hceModel, 'getPipelineEvents', false, events);
        spyOn(controller, 'parseEvent');

        controller.fetchEvents(eventsPerExecution, executionId).then(function() {
          expect(eventsPerExecution[executionId]).toEqual(events);
          expect(controller.parseEvent).toHaveBeenCalledWith(event1);
          expect(controller.parseEvent).toHaveBeenCalledWith(event2);
        }).catch(function() {
          fail('Fetch should not have failed');
        });

      });
    });

    describe('parse event', function() {
      beforeEach(function() {
        createController(true);
        spyOn(controller, 'determineLatestEvent');
      });

      afterEach(function() {
        expect(controller.determineLatestEvent).toHaveBeenCalled();
        expect(controller.determineLatestEvent.calls.argsFor(0)[0]).toBeDefined();
      });

      it('Empty event', function() {
        var event = {};
        controller.parseEvent(event);
        expect(event.mEndDate).toBeUndefined();
        expect(event.duration).toBeUndefined();
        expect(event.durationString).toEqual('Unknown');
        expect(event.name).toBeUndefined();
      });

      it('Populated event', function() {
        var event = {
          endDate: moment().format(),
          duration: 400,
          type: 'Building'
        };
        controller.parseEvent(event);
        expect(event.mEndDate).toBeDefined();
        expect(event.duration).toBeDefined();
        expect(event.durationString).toBeDefined();
        expect(event.durationString).not.toEqual('Unknown');
        expect(event.name).toBeDefined();
      });

      it('Populated event - calculate duration', function() {
        var event = {
          startDate: moment().subtract(100, 's').format(),
          endDate: moment().format()
        };
        controller.parseEvent(event);
        expect(event.mEndDate).toBeDefined();
        expect(event.duration).toBeDefined();
        expect(event.durationString).toBeDefined();
        expect(event.durationString).not.toEqual('Unknown');
      });

      it('Populated event - event types', function() {
        //['Building', 'Testing', 'Deploying', 'watchdog', 'pipeline_completed']
        var eventTypes = _.values(controller.eventTypes);
        expect(eventTypes.length).toBeGreaterThan(0);
        _.forEach(eventTypes, function(type) {
          var event = {
            type: type
          };
          controller.parseEvent(event);
          expect(event.name).toBeDefined();
        });
      });
    });

    describe('determine latest event', function() {

      var eventType = 'type';

      beforeEach(function() {
        createController(true);
        controller.last = { };
      });

      it('no previous event of this type used', function() {
        var event = {
          type: eventType
        };
        controller.determineLatestEvent(event);
        expect(controller.last[eventType]).toEqual(event);
      });

      it('later event but not succeeded', function() {
        var event = {
          type: eventType,
          mEndDate: moment()
        };
        controller.last[eventType] = event;

        var laterEvent = {
          type: eventType,
          mEndDate: moment(event.mEndDate).add(100, 's')
        };

        controller.determineLatestEvent(laterEvent);
        expect(controller.last[eventType]).toEqual(event);
      });

      it('succeeded event but not later', function() {
        var event = {
          type: eventType,
          mEndDate: moment()
        };
        controller.last[eventType] = event;

        var laterEvent = {
          type: eventType,
          mEndDate: moment(event.mEndDate).subtract(100, 's'),
          state: controller.eventStates.SUCCEEDED
        };

        controller.determineLatestEvent(laterEvent);
        expect(controller.last[eventType]).toEqual(event);
      });

      it('succeeded and later event', function() {
        var event = {
          type: eventType,
          mEndDate: moment()
        };
        controller.last[eventType] = event;

        var laterEvent = {
          type: eventType,
          mEndDate: moment(event.mEndDate).add(100, 's'),
          state: controller.eventStates.SUCCEEDED
        };

        controller.determineLatestEvent(laterEvent);
        expect(controller.last[eventType]).toEqual(laterEvent);
      });

    });

    describe('parse execution', function() {
      beforeEach(function() {
        createController(true);
      });

      it('no events obj', function() {
        var execution = {
          reason: {
            createdDate: moment().format()
          }
        };
        controller.parseExecution(execution);
        expect(execution.result).toBeUndefined();
      });

      it('empty events obj', function() {
        var execution = {
          reason: {
            createdDate: moment().format()
          }
        };
        controller.parseExecution(execution, []);
        expect(execution.result).toBeUndefined();
      });

      it('sets moment created date', function() {
        var execution = {
          reason: {
            createdDate: moment().format()
          }
        };
        controller.parseExecution(execution);
        expect(execution.reason.mCreatedDate).toBeDefined();
      });

      it('sets correct \'result\' property', function() {
        var execution = {
          reason: {
            createdDate: moment().format()
          }
        };
        var event = {
          name: 'event name',
          artifact_id: 'artifact id'
        };
        var events = [ event ];
        controller.parseExecution(execution, events);
        expect(execution.result).toBeDefined();
        expect(execution.result.state).toBeDefined();
        expect(execution.result.label).toEqual(event.name);
        expect(execution.result.hasLog).toBeTruthy();
      });
    });

    describe('determine execution result', function() {

      beforeEach(function() {
        createController(true);
      });

      it('execution completed (pipeline_complete - failed)', function() {
        var event = {
          type: controller.eventTypes.PIPELINE_COMPLETED,
          state: controller.eventStates.FAILED,
          name: 'label'
        };
        var res = controller.determineExecutionResult(event);
        expect(res.label).toEqual('Failed');
        expect(res.state).toEqual(event.state);
      });

      it('execution completed (pipeline_complete - success)', function() {
        var event = {
          type: controller.eventTypes.PIPELINE_COMPLETED,
          state: controller.eventStates.SUCCEEDED,
          name: 'label'
        };
        var res = controller.determineExecutionResult(event);
        expect(res.label).toEqual('Success');
        expect(res.state).toEqual(event.state);
      });

      it('execution completed (failed event)', function() {
        var event = {
          type: controller.eventTypes.TESTING,
          state: controller.eventStates.FAILED,
          name: 'label'
        };
        var res = controller.determineExecutionResult(event);
        expect(res.label).toEqual(event.name);
        expect(res.state).toEqual(event.state);
      });

      it('execution still running', function() {
        var event = {
          type: controller.eventTypes.TESTING,
          name: 'label'
        };
        var res = controller.determineExecutionResult(event);
        expect(res.label).toEqual(event.name);
        expect(res.state).toEqual(controller.eventStates.RUNNING);
      });
    });

    describe('determine execution state', function() {
      beforeEach(function() {
        createController(true);
      });

      it('determine state from event type', function() {
        var types = _.values(controller.eventTypes);
        _.forEach(types, function(type) {
          var origState = 'orig';
          var event = {
            type: type,
            state: origState
          };
          var state = controller.determineExecutionState(event);
          switch (type) {
            case controller.eventTypes.BUILDING:
            case controller.eventTypes.TESTING:
            case controller.eventTypes.DEPLOYING:
              expect(state).toEqual(controller.eventStates.RUNNING);
              break;
            case controller.eventTypes.PIPELINE_COMPLETED:
            case controller.eventTypes.WATCHDOG_TERMINATED:
              expect(state).toEqual(origState);
              break;
            default:
              fail('Unknown event type: ' + type);
              break;
          }
        });
      });

      it('determine state from event \'failed\' state', function() {
        var state = controller.determineExecutionState({
          state: controller.eventStates.FAILED
        });
        expect(state).toEqual(controller.eventStates.FAILED);
      });

      it('determine state from event state', function() {
        var state = controller.determineExecutionState({
          state: controller.eventStates.SUCCEEDED
        });
        expect(state).toEqual(controller.eventStates.RUNNING);
      });
    });

    describe('dynamic loading of events when execution visible - updateVisibleExecutions', function() {
      beforeEach(function() {
        createController(true);
        // Call updateModel to set up watch, we'll test if this watch is correctly called
        spyOn(hceModel, 'getProject').and.callFake(function() {
          return project;
        });
        spyOn(hceModel, 'getPipelineExecutions').and.callFake(function() {
          return $q.when();
        });
        _.set(controller, 'hceModel.data.pipelineExecutions', []);
        controller.updateData();
        $rootScope.$apply();
      });

      it('Nothing visible? Nothing to update', function() {
        spyOn(controller, 'fetchEvents');
        controller.updateVisibleExecutions();
        expect(controller.fetchEvents).not.toHaveBeenCalled();
        controller.updateVisibleExecutions([]);
        expect(controller.fetchEvents).not.toHaveBeenCalled();
      });

      it('fetch event fails', function() {
        var visibleExecutions = [
          {
            id: 'one'
          }
        ];
        spyOn(controller, 'parseExecution');
        spyOn(controller, 'fetchEvents').and.callFake(function(eventsPerExecution, id) {
          expect(eventsPerExecution).toEqual({});
          expect(id).toEqual('one');
          return $q.reject();
        });

        controller.updateVisibleExecutions(visibleExecutions);

        expect(controller.parseExecution).not.toHaveBeenCalled();
      });

      it('all events already downloaded', function() {
        var execution = {
          id: 'one',
          reason: {
            createdDate: moment().format()
          }
        };
        var eventsPerExecution = {};
        eventsPerExecution[execution.id] = {};
        _.set(controller, 'eventsPerExecution', eventsPerExecution);

        spyOn(controller, 'fetchEvents');
        spyOn(controller, 'parseExecution');

        var visibleExecutions = [execution];
        controller.updateVisibleExecutions(visibleExecutions);

        expect(controller.fetchEvents).not.toHaveBeenCalled();
        expect(controller.parseExecution).not.toHaveBeenCalled();
      });

      it('fetch event succeeds', function() {
        var execution = {
          id: 'one',
          reason: {
            createdDate: moment().format()
          }
        };
        var events = [
          {
            id: 'two'
          },
          {
            id: 'three'
          }
        ];
        var visibleExecutions = [ execution ];
        var allExecutions = [ execution ];

        _.set(controller, 'parsedHceModel.pipelineExecutions', allExecutions);
        spyOn(controller, 'fetchEvents').and.callFake(function(eventsPerExecution, id) {
          expect(eventsPerExecution).toEqual({});
          expect(id).toEqual('one');
          eventsPerExecution[id] = events;
          return $q.when(events);
        });
        spyOn(controller, 'parseExecution').and.callThrough();
        spyOn(controller, 'execWatch');

        controller.updateVisibleExecutions(visibleExecutions);
        $rootScope.$apply();

        // Ensure that for execution has been updated given the events fetched
        expect(controller.parseExecution).toHaveBeenCalled();
        expect(controller.parseExecution.calls.count()).toBe(1);
        expect(controller.parseExecution.calls.argsFor(0).length).toBe(2);
        expect(controller.parseExecution.calls.argsFor(0)[0]).toEqual(execution);
        expect(controller.parseExecution.calls.argsFor(0)[1]).toEqual(events);

        // All executions have had their events downloaded, so ensure the call to stop watching is made
        expect(controller.execWatch).toHaveBeenCalled();

      });

      it('fetch event succeeds, watch should not be killed', function() {
        var execution1 = {
          id: 'one',
          reason: {
            createdDate: moment().format()
          }
        };
        var execution2 = {
          id: 'two',
          reason: {
            createdDate: moment().format()
          }
        };
        var events = [
          {
            id: 'two'
          },
          {
            id: 'three'
          }
        ];
        var visibleExecutions = [ execution1 ];
        var allExecutions = [ execution1, execution2 ];

        _.set(controller, 'parsedHceModel.pipelineExecutions', allExecutions);
        spyOn(controller, 'fetchEvents').and.callFake(function(eventsPerExecution, id) {
          expect(eventsPerExecution).toEqual({});
          expect(id).toEqual('one');
          eventsPerExecution[id] = events;
          return $q.when(events);
        });
        spyOn(controller, 'parseExecution').and.callThrough();
        spyOn(controller, 'execWatch');

        controller.updateVisibleExecutions(visibleExecutions);
        $rootScope.$apply();

        // Ensure that for execution has been updated given the events fetched
        expect(controller.parseExecution).toHaveBeenCalled();
        expect(controller.execWatch).not.toHaveBeenCalled();

      });

    });

    describe('update data', function() {

      var execution;

      beforeEach(function() {
        createController(true);

        _.set(controller, 'hceCnsi.guid', cnsi.guid);

        execution = {
          reason: {
            createdDate: moment().format()
          }
        };
      });

      it('get executions fails', function() {
        spyOn(hceModel, 'getProject').and.callFake(function(appName) {
          expect(appName).toEqual(application.summary.name);
          return project;
        });
        spyOn(hceModel, 'getPipelineExecutions').and.callFake(function() {
          return $q.reject();
        });
        controller.updateData();
        expect(controller.hceModel.getPipelineExecutions).toHaveBeenCalled();
        expect(controller.parsedHceModel).toBeUndefined();
      });

      it('pipeline result cloned successfully, execution is parsed', function() {
        spyOn(hceModel, 'getProject').and.callFake(function(appName) {
          expect(appName).toEqual(application.summary.name);
          return project;
        });
        spyOn(hceModel, 'getPipelineExecutions').and.callFake(function(guid, projectId) {
          expect(guid).toEqual(cnsi.guid);
          expect(projectId).toEqual(project.id);
          _.set(hceModel, 'data.pipelineExecutions', [execution]);
          return $q.when();
        });
        spyOn(controller, 'parseExecution').and.callFake(function(inExecution, inEvents) {
          expect(inExecution).toEqual(execution);
          expect(inEvents).toBeUndefined(inEvents);
        });

        controller.updateData();
        $rootScope.$apply();

        expect(hceModel.getPipelineExecutions).toHaveBeenCalled();
        expect(controller.parsedHceModel).toEqual(hceModel.data);
        expect(controller.parsedHceModel).not.toBe(hceModel.data);
        expect(controller.parseExecution).toHaveBeenCalled();
      });
    });

  });

})();
