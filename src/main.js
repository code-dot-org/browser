const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const setupMenus = require('./menus');
const wrapNavigation = require('./wrapNavigation');
const {injectMainWindow} = require('./openUrlModal');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const checkForManualUpdate = require('./checkForManualUpdate');
const firehoseClient = require('./firehose');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

// Required to get correct App name in menus on OSX
// https://github.com/electron-userland/electron-builder/issues/2468
app.setName('Code.org Maker App');

let mainWindow = null;
let manualUpdateRequired = false;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      webviewTag:true,
    },
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true,
  }));

  if (process.env.OPEN_DEV_TOOLS) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  wrapNavigation();
  setupMenus();
  injectMainWindow(mainWindow);
  manualUpdateRequired = checkForManualUpdate();
  return mainWindow;
}

const debugAutoUpdate = false;
let statusWindow;

function sendStatusToWindow(text) {
  if (debugAutoUpdate) {
    statusWindow.webContents.send('message', text);
  }
  log.info(text);
}
function createAutoUpdateDebugWindow() {
  if (!debugAutoUpdate) {
    return;
  }
  statusWindow = new BrowserWindow();
  statusWindow.on('closed', () => {
    statusWindow = null;
  });
  statusWindow.loadURL(`file://${__dirname}/version.html#v${app.getVersion()}`);
  return statusWindow;
}
autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
});
autoUpdater.on('update-available', (info) => {
  sendStatusToWindow('Update available.');
});
autoUpdater.on('update-not-available', (info) => {
  sendStatusToWindow('Update not available.');
});
autoUpdater.on('error', (err) => {
  sendStatusToWindow('Error in auto-updater. ' + err);
  firehoseClient.putRecord({
    study: 'maker-autoupdate',
    event: 'error',
    data_string: JSON.stringify(err),
  });
});
autoUpdater.on('download-progress', (progressObj) => {
  let logMessage = 'Download speed: ' + progressObj.bytesPerSecond;
  logMessage = logMessage + ' - Downloaded ' + progressObj.percent + '%';
  logMessage = logMessage + ' (' + progressObj.transferred + '/' + progressObj.total + ')';
  sendStatusToWindow(logMessage);
});
autoUpdater.on('update-downloaded', (info) => {
  sendStatusToWindow('Update downloaded');
});
app.on('ready', function() {
  createMainWindow();
  createAutoUpdateDebugWindow();
  if (!manualUpdateRequired) {
    setTimeout(function() {
      autoUpdater.checkForUpdatesAndNotify();
    }, 500);
  }
});

// Adopt OSX conventions on that platform
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});
