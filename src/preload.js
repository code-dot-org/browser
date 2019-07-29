// Electron lets you define a preload script on a webview. A preload script is a
// local JavaScript file that gets executed in the context of the remote web page
// before any other scripts on the remote web page. The preload script has access
// to Electron and node.js APIs, but when it has finished executing, those APIs
// are removed from the global scope so that the remote web page doesn’t have
// access to them. The preload script also has access to the DOM of the remote
// page.

// https://github.com/electron/electron/blob/master/docs/api/webview-tag.md#preload

const SerialPort = require('serialport');
const packageJson = require('../package.json');
const {mayInjectNativeApi} = require('./originAllowlist');
const fs = require('graceful-fs');

function init() {
  if (!mayInjectNativeApi(document.location.origin)) {
    return;
  }

  // Expose a bridging API to by setting globals on `window`.
  window.SerialPort = SerialPort;
  window.MakerBridge = {
    getVersion,
  };
  window.FileSystem = fs;
}

function getVersion() {
  return packageJson.version;
}

init();
