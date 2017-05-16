/* eslint-disable no-sync,angular/json-functions,angular/typecheck-array */
(function () {
  'use strict';

  var fs = require('fs');
  var path = require('path');
  var _ = require('lodash');
  var minimatch = require('minimatch');
  var utils = require('./gulp.utils');
  var fsx = require('fs-extra');
  // var config = require('./gulp.config');
  // var buildConfig = require('./build_config.json');

  var baseFolder = path.resolve(__dirname, '..');

  var mainBowerFile, buildConfig, components;
  console.log(mainBowerFile);

  // Initialization when first brought in via require
  initialize();

  function initialize() {
    mainBowerFile = JSON.parse(fs.readFileSync(path.join(baseFolder, 'bower.json'), 'utf8'));
    buildConfig = JSON.parse(fs.readFileSync(path.join(baseFolder, 'build_config.json'), 'utf8'));
    components = findComponents();
  }

  function findComponents() {
    var components = {};
    var bowerFolder = path.join(baseFolder, 'bower_components');
    var files = fs.readdirSync(bowerFolder);
    _.each(files, function (f) {
      var folder = path.join(bowerFolder, f);
      if (fs.lstatSync(folder).isDirectory()) {
        // Check for a bower file
        var bowerFile = path.join(folder, 'bower.json');
        if (fs.existsSync(bowerFile)) {
          var bower = JSON.parse(fs.readFileSync(bowerFile, 'utf8'));
          var componentFile = path.join(folder, bower.name + '.component.json');
          if (fs.existsSync(componentFile)) {
            var component = JSON.parse(fs.readFileSync(componentFile, 'utf8'));
            components[bower.name] = component;
            component.bower = bower;
            component.folder = folder;
            component.name = bower.name;
          }
        }
      }
    });
    return components;
  }

  // TODO: Only find local components referenced in the main bower.json
  function findLocalComponents() {
    var components = [];

    var folder = path.join(baseFolder, 'components');
    var files = fs.readdirSync(folder);
    _.each(files, function (f) {
      var componentFolder = path.join(folder, f);
      console.log('Component folder: ' + componentFolder);
      if (fs.lstatSync(componentFolder).isDirectory()) {
        var bowerFile = path.join(componentFolder, 'bower.json');
        if (fs.existsSync(bowerFile)) {
          components.push(path.resolve(componentFolder));
        }
      }
    });
    return components;
  }

  function refreshLocalComponents() {
    var bowerFolder = path.resolve(__dirname, '../bower_components');
    var c = findLocalComponents(baseFolder);
    _.each(c, function (localComponentPath) {
      utils.copySingleBowerFolder(localComponentPath, bowerFolder);
    });
  }

  function getGlobs(glob, skipName, absolute) {
    var baseFolder = path.resolve(__dirname, '..');
    var c = findComponentsDependencySorted();
    var bowerFolder = path.join(baseFolder, 'bower_components');
    var n = [];
    if (!Array.isArray(glob)) {
      glob = [glob];
    }
    _.each(c, function (v) {
      _.each(glob, function (g) {
        var inverse = g.indexOf('!') === 0;
        g = !inverse ? g : g.substring(1);
        var f = skipName ? path.join(bowerFolder, v.name, g) : path.join(bowerFolder, '**', v.name, g);
        if (absolute) {
          f = path.resolve(__dirname, f);
        } else {
          f = './' + path.relative(baseFolder, f);
        }
        n.push(inverse ? '!' + f : f);
      });
    });

    return n;
  }

  function getSourceGlobs(glob, prefix) {
    var c = findComponentsDependencySorted();
    var n = [];
    if (!Array.isArray(glob)) {
      glob = [glob];
    }
    _.each(c, function (v) {
      _.each(glob, function (g) {
        var inverse = g.indexOf('!') === 0;
        g = !inverse ? g : g.substring(1);
        var name = v.templatePrefix ? v.templatePrefix : v.name;
        console.log(name);
        var f = path.join(prefix, name, g);
        n.push(inverse ? '!' + f : f);
      });
    });

    console.log(n);

    return n;
  }

  function addWiredep(config) {
    var wiredep = config.overrides;
    _.each(components, function (component) {
      _.each(component.dependencies, function (o, name) {
        var componentBower = JSON.parse(fs.readFileSync(path.join(config.directory, name, 'bower.json'), 'utf8'));
        var deps = componentBower.dependencies || {};
        _.defaults(deps, o);
        wiredep[name] = { dependencies: deps };
      });
    });
    return config;
  }

  function getDependencies(cpmnts) {
    var depends = {};
    _.each(cpmnts, function (component) {
      _.each(component.dependencies, function (o, name) {
        var componentBower = JSON.parse(fs.readFileSync(path.join('./bower_components', name, 'bower.json'), 'utf8'));
        var deps = componentBower.dependencies || {};
        _.defaults(deps, o);
        depends[name] = deps;
      });
    });
    return depends;
  }

  function findComponentsDependencySorted() {
    var depends = getDependencies(components);
    var names = _.map(components, 'name');
    var list = resolve(depends, components, names);
    return _.map(list, function (name) {
      return components[name];
    });
  }

  function resolve(depends, cpmnts, names) {
    var list = [];
    _.each(names, function (name) {
      if (cpmnts[name]) {
        var deps = _.keys(depends[name]);
        list = _.concat(resolve(depends, cpmnts, deps), list);
        list.push(name);
        list = _.uniqBy(list);
      }
    });

    return list;
  }

  function findMainFile(pattern) {
    var dependencies = findComponentsDependencySorted();
    var files = [];
    _.each(dependencies, function (defn) {
      _.each(defn.bower.main, function (file) {
        if (minimatch(file, pattern)) {
          files.push(path.join(defn.folder, file));
        }
      });
    });

    return files;
  }

  function copyTo(dest) {
    var dependencies = findComponentsDependencySorted();
    _.each(dependencies, function (c) {
      var destPath = path.join(dest, c.name);
      if (c.templatePrefix) {
        destPath = path.join(dest, c.templatePrefix);
      }

      var srcPath = path.join(c.folder, 'src');
      console.log('COPYING: ' + srcPath + ' TO ' + destPath);
      if (fs.existsSync(srcPath)) {
        fsx.ensureDirSync(destPath);
        fsx.copySync(srcPath, destPath);
      }
    });
  }

  function transformPath(p) {
    var parts = p.split(path.sep);
    var name = parts[0];
    parts.splice(1,1);
    if (components[name] && components[name].templatePrefix) {
      parts[0] = components[name].templatePrefix;
    }
    return parts.join(path.sep);
  }

  function renamePath(p) {
    p.dirname = transformPath(p.dirname);
    return p;
  }

  function getBuildConfig() {
    return buildConfig;
  }

  module.exports.initialize = initialize;
  module.exports.getBuildConfig = getBuildConfig;
  module.exports.findComponents = findComponents;
  module.exports.findLocalComponents = findLocalComponents;
  module.exports.refreshLocalComponents = refreshLocalComponents;
  module.exports.getGlobs = getGlobs;
  module.exports.getSourceGlobs = getSourceGlobs;
  module.exports.addWiredep = addWiredep;
  module.exports.findMainFile = findMainFile;
  module.exports.copyTo = copyTo;
  module.exports.renamePath = renamePath;
  module.exports.transformPath = transformPath;
  module.exports.findComponentsDependencySorted = findComponentsDependencySorted;

})();
