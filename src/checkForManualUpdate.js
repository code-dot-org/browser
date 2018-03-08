const {app, dialog, shell} = require('electron');

function checkForManualUpdate() {
  const manualUpdate = app.getVersion().startsWith('1.0.9');
  if (manualUpdate) {
    dialog.showMessageBox(
      {
        type: 'info',
        buttons: ['Download Now', 'Cancel'],
        title: 'Update Available',
        message: 'An update is available, would you like to download it now?',
        detail: 'If you have already installed the new version (Code.org Maker App) and are still seeing this message, you may need to delete the old one (Maker Toolkit) from your system.',
        cancelId: 1,
      },
      (response, _) => {
        if (response === 0) {
          shell.openExternal('https://studio.code.org/maker/setup');
          app.quit();
        }
      }
    );
  }
  return manualUpdate;
}

module.exports = checkForManualUpdate;
