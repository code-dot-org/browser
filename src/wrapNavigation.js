const {app, shell} = require('electron');
const {URL} = require('url');

/**
 * For the given webview, attaches to the 'will-navigate' event and redirects
 * attempted navigation to a non-whitelisted site to the system's default
 * browser instead of navigating within the webview itself.
 * @param {WebviewTag} webview
 */
function wrapNavigation(webview) {
  // We apply this behavior to all created webviews, whenever they get created,
  // because we have to handle this event on the main thread.
  // This is the preferred approach to capturing and preventing navigation
  // within a webview; see:
  // https://github.com/electron/electron/issues/1378#issuecomment-265207386
  app.on('web-contents-created', (_, contents) => {
    if (contents.getType() === 'webview') {
      contents.on('will-navigate', (event, url) => {
        if (!isDestinationWhitelistedForNavigation(url)) {
          event.preventDefault();
          shell.openExternal(url);
        }
        // Otherwise fall through and navigation will proceed normally.
      })
    }
  });
}

/**
 * @param {string} url
 * @return {boolean} TRUE if the target page is allowed to load within the
 *   Maker Toolkit Browser.
 */
function isDestinationWhitelistedForNavigation(url) {
  // Get origin from full URL
  const origin = new URL(url).origin;

  if (navigationBlacklist.some(blacklisted => blacklisted.test(origin))) {
    return false;
  }

  // Match origins:
  // https://studio.code.org                          Production
  // https://test-studio.code.org                     Test
  // https://dashboard-adhoc-my-branch.cdn-code.org   Ad-Hoc servers
  // http://localhost-studio.code.org:3000            Local development
  return /^https?:\/\/(?:[\w\d-]+\.)?(?:cdn-)?code\.org(?::\d+)?$/i.test(origin);
}

/**
 * Navigation to urls matching any of the given origins will open the page in
 * the system default browser, instead of within Maker Toolkit Browser, even
 * if the origin falls within our general Code.org origin whitelist.
 * @type {Array.<RegExp>}
 */
const navigationBlacklist = [
  /curriculum\.code\.org$/i,
  /documentation\.code\.org$/i,
  /forum\.code\.org$/i,
  /support\.code\.org$/i,
  /wiki\.code\.org$/i,
];

module.exports = wrapNavigation;