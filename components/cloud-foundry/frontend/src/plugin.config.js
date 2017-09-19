(function () {
  'use strict';

  // register this plugin application to the platform
  if (env && env.registerApplication) {
    env.registerApplication(
      'cloudFoundry', // plugin application identity
      'cloud-foundry', // plugin application's root angular module name
      'plugins/cloud-foundry/', // plugin application's base path
      'cf.applications.list.gallery-view' // plugin applications's start state
    );
  }

}());
