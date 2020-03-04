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
const Avrgirl = require('avrgirl-arduino');
const md5 = require('blueimp-md5');

function init() {
  if (!mayInjectNativeApi(document.location.origin)) {
    return;
  }

  // Expose a bridging API to by setting globals on `window`.
  window.SerialPort = SerialPort;
  window.MakerBridge = {
    getVersion,
    flashBoardFirmware,
  };
}

/**
 * Flash firmware of board with contents of specified hex file.
 * @param {Object} flashInfo, info to flash board
 * @param {String} flashInfo.boardName, name of board from Avrgirl options
 * @param {String} flashInfo.hexPath, path to hex file to flash to board
 * @param {String} flashInfo.checksum, checksum to verify valid hex download
 * @return {Promise}
 */
function flashBoardFirmware(flashInfo) {
  return new Promise((resolve, reject) => {
    let avrgirl = new Avrgirl({board: flashInfo.boardName});
    window.fetch(flashInfo.hexPath)
      .then(function(response) {
        // Hard coded checksum value to verify valid hex download
        if (md5(response) === flashInfo.checksum) {
          response.arrayBuffer().then(function(body) {
            // Pass the response buffer to flash function to avoid filesystem error
            avrgirl.flash(Buffer.from(body), (error) => {
              if (error) {
                reject(new Error(error));
              } else {
                console.log('Firmware Updated');
                resolve();
              }
            });
          });
        } else {
          reject(new Error('Error downloading firmware for board.'));
        }
      });
  });
}

function getVersion() {
  return packageJson.version;
}

init();
