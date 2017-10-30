const {Menu, shell} = require('electron');
const packageJson = require('../package.json');

module.exports = function setupMenus() {
  const template = [
    {
      label: 'View',
      submenu: [
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click(_, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.send('reload-requested');
            }
          }
        },
        {
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
        },
        {
          label: 'Toggle Electron Developer Tools',
          click(_, focusedWindow) {
            if (focusedWindow) {
              focusedWindow.webContents.toggleDevTools();
            }
          }
        }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Maker Toolkit Browser',
          enabled: false,
        },
        {
          label: 'Code.org 2017',
          enabled: false,
        },
        {
          label: `Version ${packageJson.version}`,
          click() {
            shell.openExternal(`https://github.com/code-dot-org/browser/releases/tag/v${packageJson.version}`);
          }
        }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
};
