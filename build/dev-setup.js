// Copy files required for developer quick start
// Implemented as a single script here so that it works on Windows, Linux and Mac

const path = require('path');
const fs = require('fs');

// __dirname is the folder where build.js is located
const STRATOS_DIR= path.resolve(__dirname, '..');

// Only copy files if they are not already there - just make sure initial versions are in place for developer

// Proxy config file
const PROXY_CONF = path.join(STRATOS_DIR, 'proxy.conf.js');
if (!fs.existsSync(PROXY_CONF)) {
  let err = fs.copyFileSync(path.join(__dirname, 'proxy.conf.localdev.js'), PROXY_CONF);
  if (err) {
    console.log(err);
  }
}

// config.properties
const BACKEND_DIR = path.join(STRATOS_DIR, 'src', 'jetstream');
const BACKEND_CONF = path.join(BACKEND_DIR, 'config.properties');
const BACKEND_CONF_DEV = path.join(BACKEND_DIR, 'config.dev');
if (!fs.existsSync(BACKEND_CONF)) {
  let err = fs.copyFileSync(BACKEND_CONF_DEV, BACKEND_CONF);
  if (err) {
    console.log(err);
  }
}

// _custom-import.module.ts
const CORE_SRC_DIR = path.join(STRATOS_DIR, 'src', 'frontend', 'packages', 'core', 'src');
const IMPORT_DEFAULT = path.join(CORE_SRC_DIR, 'custom-import.module.ts');
const IMPORT_FILE = path.join(CORE_SRC_DIR, '_custom-import.module.ts');
if (!fs.existsSync(IMPORT_FILE)) {
  let err = fs.copyFileSync(IMPORT_DEFAULT, IMPORT_FILE);
  if (err) {
    console.log(err);
  }
}
