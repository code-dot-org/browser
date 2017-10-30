const {app, Menu, shell} = require('electron');
const packageJson = require('../package.json');

const RELOAD_WEBVIEW = {
  label: 'Reload',
  accelerator: 'CmdOrCtrl+R',
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.send('reload-requested');
    }
  }
};

const TOGGLE_WEBVIEW_DEVTOOLS = {
  label: 'Toggle Developer Tools',
  accelerator: (
    process.platform === 'darwin' ?
      'Alt+Command+I' :
      'Ctrl+Shift+I'
  ),
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.send('toggle-dev-tools-requested');
    }
  }
};

const TOGGLE_ELECTRON_DEVTOOLS = {
  label: 'Toggle Electron Developer Tools',
  click(_, focusedWindow) {
    if (focusedWindow) {
      focusedWindow.webContents.toggleDevTools();
    }
  }
};

const VERSION = {
  label: `Version ${packageJson.version}`,
  click() {
    shell.openExternal(`https://github.com/code-dot-org/browser/releases/tag/v${packageJson.version}`);
  }
};

module.exports = function setupMenus() {
  // The initial menu item on Windows and Linux, often named 'File'
  const fileMenu = {
    label: 'File',
    submenu: [
      {role: 'quit'}
    ]
  };

  // The initial menu item on OSX, always named for the application
  const osxAppMenu = {
    label: app.getName(),
    submenu: [
      {role: 'about'},
      VERSION,
      {type: 'separator'},
      {role: 'services', submenu: []},
      {type: 'separator'},
      {role: 'hide'},
      {role: 'hideothers'},
      {role: 'unhide'},
      {type: 'separator'},
      {role: 'quit'}
    ]
  };

  const viewMenu = {
    label: 'View',
    submenu: [
      RELOAD_WEBVIEW,
      TOGGLE_WEBVIEW_DEVTOOLS,
      TOGGLE_ELECTRON_DEVTOOLS
    ]
  };

  const helpMenu = {
    label: 'Help',
    submenu: [
      {
        label: 'Maker Toolkit Browser',
        enabled: false,
      },
      VERSION,
    ]
  };

  const osxHelpMenu = {
    role: 'help'
  };

  // We define menus differently on OSX:
  let menu;
  if (process.platform === 'darwin') {
    menu = Menu.buildFromTemplate([
      osxAppMenu,
      viewMenu,
      osxHelpMenu
    ]);
  } else {
    menu = Menu.buildFromTemplate([
      fileMenu,
      viewMenu,
      helpMenu
    ]);
  }

  Menu.setApplicationMenu(menu);
};
