/** @file Main process setup for "Open URL..." dialog */
const {BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const url = require('url');
const {REQUEST_NAVIGATION, NAVIGATION_REQUESTED} = require('../channelNames');

let _mainWindow;
let _isOpen = false;
function injectMainWindow(mainWindow) {
  _mainWindow = mainWindow;
}

function showOpenUrlModal() {
  if (!_mainWindow) {
    throw new Error('A reference to the main window has not been established.');
  }

  // Only open one of these at a time.
  if (_isOpen) {
    return;
  }

  const modal = new BrowserWindow({
    width: 360,
    height: 80,
    show: false,
    parent: _mainWindow,
    modal: true,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      webviewTag:true,
    },
  });

  modal.loadURL(url.format({
    pathname: path.join(__dirname, 'view.html'),
    protocol: 'file:',
    slashes: true,
  }));

  ipcMain.on(REQUEST_NAVIGATION, handleNavigation);
  modal.once('ready-to-show', () => modal.show());
  modal.once('closed', () => {
    ipcMain.removeListener(REQUEST_NAVIGATION, handleNavigation);
    _isOpen = false;
  });
  _isOpen = true;
}

function handleNavigation(_, url) {
  if (!_mainWindow) {
    throw new Error('A reference to the main window has not been established.');
  }
  _mainWindow.webContents.send(NAVIGATION_REQUESTED, url);
}

module.exports = {
  injectMainWindow,
  showOpenUrlModal,
};
