/**
 * @file Customizes which pages can be visited within Code.org Maker App.
 *
 * Process: Main
 */
const {app, BrowserWindow} = require('electron');
const {NAVIGATION_REQUESTED} = require('./channelNames');

/**
 * For every created webview, attaches to navigation events and makes
 * links that would normally open in a new tab/window open in the
 * existing view.
 */
function wrapNavigation() {
  // We apply this behavior to all created webviews, whenever they get created,
  // because we have to handle this event on the main thread.
  // This is the preferred approach to capturing and preventing navigation
  // within a webview.
  // @see https://github.com/electron/electron/issues/1378#issuecomment-265207386
  // @see https://electron.atom.io/docs/api/app/#event-web-contents-created
  app.on('web-contents-created', (_, webContents) => {
    if (webContents.getType() !== 'webview') {
      return;
    }

    // Capture requests to open a new tab or window, triggered by calls to
    // `window.open` or links with `target="_blank"`, and handle them
    // manually, navigating the existing webview for links within the
    // Code.org Maker App walled garden and opening all other links in the
    // system default browser.
    // @see https://electron.atom.io/docs/api/web-contents/#event-new-window
    webContents.on('new-window', (event, url) => {
      // This `preventDefault()` call may be redundant for a webview, but
      // will prevent a new Electron window from being created if we ever
      // call this method in the wrong context.
      // @see https://github.com/electron/electron/issues/1963
      event.preventDefault();
      const focusedWindow = BrowserWindow.getFocusedWindow();
      if (focusedWindow) {
        focusedWindow.webContents.send(NAVIGATION_REQUESTED, url);
      } else {
        console.warn('Unable to navigate, there is no focused window.');
      }
    });
  });
}

module.exports = wrapNavigation;
