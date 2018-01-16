const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const setupMenus = require('./menus');
const wrapNavigation = require('./wrapNavigation');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';
log.info('App starting...');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
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
  setTimeout(function() {
    autoUpdater.checkForUpdatesAndNotify();
  }, 500);
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
