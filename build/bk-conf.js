(function () {
  'use strict';

  var path = require('path');
  module.exports = {
    goPath: path.join('src', 'github.com', 'SUSE', 'stratos-ui'),
    getVendorPath: function (srcPath) {
      return path.join(srcPath, 'vendor', 'github.com', 'SUSE', 'stratos-ui');
    },
    getCorePath: function (srcPath, executable) {
      return path.join(srcPath, 'app-core', 'backend', executable ? executable : '');
    },
    coreName: 'portal-proxy',
    outputPath: path.join(__dirname, '..', 'outputs'),
    srcPath: path.join(__dirname, 'components')
  };
})();
