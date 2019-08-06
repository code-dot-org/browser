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

const BOARD_TYPE = {
  CLASSIC: 'classic',
  OTHER: 'other',
};

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
 * For Circuit Playground Classic board, flash firmware from the hex url to this board.
 * @param boardType, string
 * @return {Promise}
 */
function flashBoardFirmware(boardType) {
  return new Promise((resolve, reject) => {
    if (boardType === BOARD_TYPE.CLASSIC) {
      let avrgirl = new Avrgirl({board: 'circuit-playground-classic'});
      window.fetch('https://s3.amazonaws.com/downloads.code.org/maker/CircuitPlaygroundFirmata.ino.circuitplay32u4.hex')
        .then(function(response) {
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
        });
    } else {
      resolve();
    }
  });
}

function getVersion() {
  return packageJson.version;
}

init();
