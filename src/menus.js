/**
 * @file Creates menus for Code.org Maker App.
 *
 * Process: Main
 */

const {app, Menu, shell} = require('electron');
const packageJson = require('../package.json');
const {
  RELOAD_REQUESTED,
  TOGGLE_DEV_TOOLS_REQUESTED,
} = require('./channelNames');
const {showOpenUrlModal} = require('./openUrlModal');

const RELOAD_WEBVIEW = {
  label: 'Reload',
  accelerator: 'CmdOrCtrl+R',
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.send(RELOAD_REQUESTED);
    }
  },
};

const TOGGLE_WEBVIEW_DEVTOOLS = {
  label: 'Toggle Developer Tools',
  accelerator: (
    process.platform === 'darwin'
      ? 'Alt+Command+I'
      : 'Ctrl+Shift+I'
  ),
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.send(TOGGLE_DEV_TOOLS_REQUESTED);
    }
  },
};

const TOGGLE_ELECTRON_DEVTOOLS = {
  label: 'Toggle Electron Developer Tools',
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
  },
};

const VERSION = {
  label: `Version ${packageJson.version}`,
  click() {
    shell.openExternal(`https://github.com/code-dot-org/browser/releases/tag/v${packageJson.version}`);
  },
};

const OPEN_URL = {
  label: 'Open URL...',
  accelerator: (process.platform === 'darwin' ? 'Command+O' : 'Ctrl+O'),
  click: showOpenUrlModal,
};

module.exports = function setupMenus() {
  // The initial menu item on Windows and Linux, often named 'File'
  const fileMenu = {
    label: 'File',
    submenu: [
      OPEN_URL,
      {role: 'quit'},
    ],
  };

  // The initial menu item on OSX, always named for the application
  const osxAppMenu = {
    label: app.getName(),
    submenu: [
      {role: 'about'},
      VERSION,
      {type: 'separator'},
      OPEN_URL,
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'},
    ],
  };

  const viewMenu = {
    label: 'View',
    submenu: [
      RELOAD_WEBVIEW,
      TOGGLE_WEBVIEW_DEVTOOLS,
      TOGGLE_ELECTRON_DEVTOOLS,
    ],
  };

  const helpMenu = {
    label: 'Help',
    submenu: [
      {
        label: 'Code.org Maker App',
        enabled: false,
      },
      VERSION,
    ],
  };

  const osxHelpMenu = {
    role: 'help',
  };

  const editMenu = {
    label: 'Edit',
    submenu: [
      { label: 'Undo', accelerator: 'CmdOrCtrl+Z', selector: 'undo:' },
      { label: 'Redo', accelerator: 'Shift+CmdOrCtrl+Z', selector: 'redo:' },
      { type: 'separator' },
      { label: 'Cut', accelerator: 'CmdOrCtrl+X', selector: 'cut:' },
      { label: 'Copy', accelerator: 'CmdOrCtrl+C', selector: 'copy:' },
      { label: 'Paste', accelerator: 'CmdOrCtrl+V', selector: 'paste:' },
      { label: 'Select All', accelerator: 'CmdOrCtrl+A', selector: 'selectAll:' },
    ],
  };

  // We define menus differently on OSX:
  let menu;
  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate([
      osxAppMenu,
      editMenu,
      viewMenu,
      osxHelpMenu,
    ]);
  } else {
    menu = Menu.buildFromTemplate([
      fileMenu,
      editMenu,
      viewMenu,
      helpMenu,
    ]);
  }

  Menu.setApplicationMenu(menu);
};
