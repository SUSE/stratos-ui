(function () {
  'use strict';

  angular
    .module('cloud-foundry.view.applications.application.delivery-logs')
    .controller('eventDetailViewController', EventDetailViewController);

  EventDetailViewController.$inject = [
    '$timeout',
    '$log',
    'context',
    'content',
    'moment',
    'app.model.modelManager'
  ];

  /**
   * @name EventDetailViewController
   * @constructor
   * @param {object} $timeout - the angular $timeout service
   * @param {object} $log - the Angular $log service
   * @param {object} context - parameter object passed in to DetailView
   * @param {object} content - configuration object passed in to DetailView
   * @param {object} moment - the moment timezone component
   * @param {app.model.modelManager} modelManager - the Model management service
   * @property {object} context - parameter object passed in to DetailView
   * @property {object} content - configuration object passed in to DetailView
   * @property {object} log - The log / artifact associated with the event
   * @property {string} duration - The duration of the event
   */
  function EventDetailViewController($timeout, $log, context, content, moment, modelManager) {
    var vm = this;
    vm.context = context;
    vm.content = content;
    vm.log = null;

    var event = vm.context.event;

    var hceModel = modelManager.retrieve('cloud-foundry.model.hce');

    // If we fetch large files before the slideout is shown the animation looks odd. Provide a pause before we fetch
    $timeout(function() {
      hceModel.downloadArtifact(vm.context.guid, event.artifact_id)
        .then(function(artifact) {
          if (artifact) {
            vm.log = artifact;
          } else {
            vm.log = false;
          }
        })
        .catch(function(error) {
          $log.error('Failed to download artifact with id: ' + event.artifact_id, error);
        })
        .finally(function() {
          if (!vm.log) {
            vm.log = false;
          }
        });
    }, 400);

    // The design shows this as a human readible but vague 'a few seconds' ago. Moment humanize matches this.
    // Need to loop back and understand the requirement (only show this for a few seconds/show something more accurate
    // for longer durations/etc)
    vm.duration = moment.duration(event.duration, 'ms').humanize();
  }

})();
