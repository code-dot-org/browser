/**
 * Model for Code.org user information for use from the Maker Browser context.
 * @class User
 */
class User {
  constructor(name) {
    Object.defineProperty(this, 'name', {
      value: name,
      enumerable: true
    });
  }

  /**
   * Check for the currently signed-in user, by querying the loaded Code.org
   * page in the webview.
   * Assumes access to the Electron document (should be called on Render thread)
   * @return {Promise.<User>} Resolves to an initialized User object if the
   *   current user is signed in on a Code.org page, rejects otherwise.
   */
  static getCurrentUser() {
    const webview = document.querySelector('webview');
    return readRackEnv(webview)
      .then(rackEnv => readCookie(webview, shortNameCookie(rackEnv)))
      .then(shortName => new User(shortName))
      .catch(err => Promise.reject(err))
  }
}

/**
 * @param {webview} webview
 * @returns {Promise.<string>} resolved to rack env for page loaded in webview
 */
function readRackEnv(webview) {
  return new Promise((resolve, reject) => {
    webview.executeJavaScript('window.dashboard.rack_env', false, (rackEnv) => {
      rackEnv ? resolve(rackEnv) : reject();
    });
  });
}

function shortNameCookie(rackEnv) {
  return environmentifyCookie(rackEnv, '_shortName');
}

function environmentifyCookie(rackEnv, cookieName) {
  if (rackEnv === 'production') {
    return cookieName;
  }
  return `${cookieName}_${rackEnv}`;
}

function readCookie(webview, cookieName) {
  return new Promise((resolve, reject) => {
    const cookies = webview.getWebContents().session.cookies;
    cookies.get(
      {
        name: cookieName,
        domain: '.code.org'
      },
      (_, foundCookies) => {
        if (foundCookies.length > 0) {
          resolve(foundCookies[0].value);
        } else {
          reject();
        }
      }
    );
  });
}

module.exports = User;
