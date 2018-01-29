/* eslint-disable no-process-env, no-sync */
(function () {
  'use strict';

  var childProcess = require('child_process');
  var process = require('process');
  var Q = require('q');
  var fs = require('fs-extra');
  var _ = require('lodash');
  var path = require('path');

  var prepareBuild = require('./bk-prepare-build');
  var nodePackageFile = require('../package.json');

  var env, devConfig;

  module.exports.init = function () {
    env = process.env;
    env.GOPATH = prepareBuild.getGOPATH();
  };

  module.exports.runGlideInstall = runGlideInstall;
  module.exports.build = build;
  module.exports.test = test;
  module.exports.localDevSetup = localDevSetup;
  module.exports.isLocalDevBuild = isLocalDevBuild;
  module.exports.skipGlideInstall = skipGlideInstall;

  function localDevSetup() {
    if (isLocalDevBuild()) {
      process.env.STRATOS_TEMP = path.resolve(__dirname, '../tmp');
      fs.mkdirpSync(process.env.STRATOS_TEMP);
      prepareBuild.localDevSetup = true;
    }
  }

  // Get dev config from the dev config file if it exists
  function getDevConfig() {
    if (!devConfig) {
      devConfig = {};
      var devConfigFile = path.join(__dirname, 'dev_config.json');
      if (fs.existsSync(devConfigFile)) {
        devConfig = require(devConfigFile);
      }
    }
    return devConfig;
  }

  function skipGlideInstall() {
    if (isLocalDevBuild()) {
      // Skip glide install if ...
      // .. we're in test mode and we've found a common test dependency
      // .. we're building the backend and we've found a common dependency
      var folder = prepareBuild.getBuildTest()
        ? path.join(env.GOPATH, 'src', 'github.com', 'smartystreets', 'goconvey', 'convey')
        : path.join(env.GOPATH, 'src', 'github.com', 'labstack', 'echo');
      return fs.existsSync(folder);
    }
    return false;
  }

  function spawnProcess(processName, args, cwd, env) {
    var deferred = Q.defer();
    var task = childProcess.spawn(processName, args, {
      env: env,
      cwd: cwd,
      stdio: 'inherit'
    });

    task.on('exit', function (code) {
      if (code !== 0) {
        deferred.reject('Process failed with code: ' + code);
        return;
      }
      deferred.resolve();
    });
    task.on('error', function (err) {
      deferred.reject('Process failed with error: ' + err);
    });
    return deferred.promise;
  }

  function runGlideInstall(path) {
    var glideArgs = ['install'];
    if (!prepareBuild.getBuildTest()) {
      glideArgs.push('--skip-test');
    }
    return spawnProcess('glide', glideArgs, path, env);
  }

  function isLocalDevBuild() {
    return !!getDevConfig().localDevBuild;
  }

  function build(srcPath, exeName, plugins) {
    var args = ['build', '-i', '-o', exeName];

    if (plugins && plugins.length) {
      prepareBuildWithoutPluginSupport(srcPath, plugins);
    }

    // Set the console version from that of the package.json and the git commit
    return getVersion().then(function (version) {
      if (version) {
        args.push('-ldflags');
        args.push('-X=main.appVersion=' + version);
      }
      return spawnProcess('go', args, srcPath, env);
    });
  }

  function test(path) {
    return spawnProcess('go', ['test', '-v'], path, env);
  }

  function getVersion() {
    var deferred = Q.defer();
    var version = nodePackageFile.version;
    if (version) {
      var args = ['log', '-1', '--format="%h"'];
      childProcess.execFile('git', args, function (error, stdout) {
        if (error === null) {
          var commitSha = _.trim(stdout);
          commitSha = _.trimStart(commitSha, '"');
          commitSha = _.trimEnd(commitSha, '"');
          deferred.resolve(version + '-' + commitSha);
        } else {
          deferred.resolve(version);
        }
      });
    } else {
      deferred.resolve('dev');
    }
    return deferred.promise;
  }

  function prepareBuildWithoutPluginSupport(srcPath, pluginsToInclude) {
    var imports = '';
    var inits = '';

    _.each(pluginsToInclude, function (plugin) {
      var pkgName = replaceAll(plugin.pluginName, '-', '');
      pkgName = replaceAll(plugin.pluginName, '_', '');
      imports += '\t"github.com/SUSE/stratos-ui/' + pkgName + '"\n';
      inits += '\tplugin, _ = ' + pkgName + '.Init(pp)\n\tpp.Plugins["' + pkgName + '"] = plugin\n';
      inits += '\tlog.Info("Loaded plugin: ' + pkgName + '")\n';
    });

    // Patch the static plugin loader
    var pluginLoader = path.join(srcPath, 'load_plugins.go');
    var loader = fs.readFileSync(pluginLoader).toString();
    loader = loader.replace('//@@IMPORTS@@', imports);
    loader = loader.replace('//@@INITS@@', inits);
    fs.writeFileSync(pluginLoader, loader);
  }

  function replaceAll(target, search, replacement) {
    return target.split(search).join(replacement);
  }

})();
