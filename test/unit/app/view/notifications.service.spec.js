(function () {
  'use strict';

  describe('notifications service', function () {
    var notifications, toaster;

    beforeEach(module('templates'));
    beforeEach(module('green-box-console'));

    beforeEach(inject(function ($injector) {
      notifications = $injector.get('appNotificationsService');
      toaster = $injector.get('helion.framework.widgets.toaster');
    }));

    describe('notify method', function () {

      it('should be defined', function () {
        expect(notifications).toBeDefined();
        expect(notifications.notify).toBeDefined();
      });

      it('show busy toast', function () {
        spyOn(toaster, 'busy');
        notifications.notify('busy', 'test_message');
        expect(toaster.busy).toHaveBeenCalled();
      });

      it('show error toast', function () {
        spyOn(toaster, 'error');
        notifications.notify('error', 'test_message');
        expect(toaster.error).toHaveBeenCalled();
      });

      it('show success toast', function () {
        spyOn(toaster, 'success');
        notifications.notify('success', 'test_message');
        expect(toaster.success).toHaveBeenCalled();
      });

      it('show warning toast', function () {
        spyOn(toaster, 'warning');
        notifications.notify('warning', 'test_message');
        expect(toaster.warning).toHaveBeenCalled();
      });

      it('show custom toast', function () {
        spyOn(toaster, 'show');
        notifications.notify('custom', 'test_message');
        expect(toaster.show).toHaveBeenCalled();
      });

    });

    describe('events', function () {

      var appEventService;

      beforeEach(inject(function ($injector) {
        appEventService = $injector.get('appEventService');
      }));

      var eventData = {
        message: 'test message',
        options: {}
      };

      it('show busy toast', function () {
        spyOn(toaster, 'busy');
        appEventService.$emit('cf.events.NOTIFY_BUSY', eventData);
        expect(toaster.busy).toHaveBeenCalled();
      });

      it('show error toast', function () {
        spyOn(toaster, 'error');
        appEventService.$emit('cf.events.NOTIFY_ERROR', eventData);
        expect(toaster.error).toHaveBeenCalled();
      });

      it('show success toast', function () {
        spyOn(toaster, 'success');
        appEventService.$emit('cf.events.NOTIFY_SUCCESS', eventData);
        expect(toaster.success).toHaveBeenCalled();
      });

      it('show warning toast', function () {
        spyOn(toaster, 'warning');
        appEventService.$emit('cf.events.NOTIFY_WARNING', eventData);
        expect(toaster.warning).toHaveBeenCalled();
      });

      it('show custom toast', function () {
        spyOn(toaster, 'show');
        appEventService.$emit('cf.events.NOTIFY', eventData);
        expect(toaster.show).toHaveBeenCalled();
      });

    });

  });

})();
