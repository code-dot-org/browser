const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const setupMenus = require('./menus');

let mainWindow = null;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  if (process.env.OPEN_DEV_TOOLS) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  setupMenus();
}

app.on('ready', createMainWindow);

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

