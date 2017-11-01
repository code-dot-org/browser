const {ipcRenderer} = require('electron');

// First step: Always be production, unless told otherwise.
if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = "production";

const {HOME_URL, MAKER_SETUP_URL, SIGN_IN_URL} = require('./defaults');

window.onresize = doLayout;
var isLoading = false;
var isSignedIn = false;

// Handle requests from Electron menu items
ipcRenderer.on('reload-requested', () => {
  if (!isLoading) {
    document.querySelector('webview').reload();
  }
});
ipcRenderer.on('toggle-dev-tools-requested', () => {
  const webview = document.querySelector('webview');
  if (webview.isDevToolsOpened()) {
    webview.closeDevTools();
  } else {
    webview.openDevTools();
  }
});

onload = function() {
  var webview = document.querySelector('webview');
  doLayout();

  document.querySelector('#back').onclick = function() {
    webview.goBack();
  };

  document.querySelector('#forward').onclick = function() {
    webview.goForward();
  };

  document.querySelector('#home').onclick = function() {
    if (isSignedIn) {
      navigateTo(HOME_URL);
    } else {
      navigateTo(SIGN_IN_URL)
    }
  };

  document.querySelector('#reload').onclick = function() {
    if (isLoading) {
      webview.stop();
    } else {
      webview.reload();
    }
  };
  document.querySelector('#reload').addEventListener(
    'webkitAnimationIteration',
    function () {
      if (!isLoading) {
        document.body.classList.remove('loading');
      }
    }
  );

  document.querySelector('#setup').onclick = function() {
    navigateTo(MAKER_SETUP_URL);
  };

  webview.addEventListener('close', handleExit);
  webview.addEventListener('did-start-loading', handleLoadStart);
  webview.addEventListener('did-stop-loading', handleLoadStop);
  webview.addEventListener('did-fail-load', handleLoadAbort);
  webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
  webview.addEventListener('did-finish-load', handleLoadCommit);

  navigateTo(HOME_URL);
};

function environmentSpecificCookieName(rackEnv, cookieName) {
  if (rackEnv === 'production') {
    return cookieName;
  }
  return `${cookieName}_${rackEnv}`;
}

var _userNameCookieKey;
function userNameCookieKey() {
  if (_userNameCookieKey) {
    return Promise.resolve(_userNameCookieKey);
  }

  return new Promise((resolve, reject) => {
    var webview = document.querySelector('webview');
    webview.executeJavaScript('window.dashboard.rack_env', false, rackEnv => {
      if (!rackEnv) {
        return reject();
      }
      _userNameCookieKey = environmentSpecificCookieName(rackEnv, '_shortName');
      resolve(_userNameCookieKey);
    });
  });
}

function readCookie(cookieKey) {
  return new Promise((resolve, reject) => {
    var webview = document.querySelector('webview');
    const cookies = webview.getWebContents().session.cookies;
    cookies.get(
      {
        name: cookieKey,
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

function checkSignInState() {
  userNameCookieKey()
    .then(key => readCookie(key))
    .then(() => {
      isSignedIn = true;
    }).catch(() => {
      isSignedIn = false;
    });
}

function navigateTo(url) {
  resetExitedState();
  document.querySelector('webview').src = url;
}

function doLayout() {
  var webview = document.querySelector('webview');
  var controls = document.querySelector('#controls');
  var controlsHeight = controls.offsetHeight;
  var windowWidth = document.documentElement.clientWidth;
  var windowHeight = document.documentElement.clientHeight;
  var webviewWidth = windowWidth;
  var webviewHeight = windowHeight - controlsHeight;

  webview.style.width = webviewWidth + 'px';
  webview.style.height = webviewHeight + 'px';

  var sadWebview = document.querySelector('#sad-webview');
  sadWebview.style.width = webviewWidth + 'px';
  sadWebview.style.height = webviewHeight * 2/3 + 'px';
  sadWebview.style.paddingTop = webviewHeight/3 + 'px';
}

function handleExit(event) {
  console.log(event.type);
  document.body.classList.add('exited');
  if (event.type == 'abnormal') {
    document.body.classList.add('crashed');
  } else if (event.type == 'killed') {
    document.body.classList.add('killed');
  }
}

function resetExitedState() {
  document.body.classList.remove('exited');
  document.body.classList.remove('crashed');
  document.body.classList.remove('killed');
}

function handleLoadCommit() {
  resetExitedState();
  var webview = document.querySelector('webview');
  document.querySelector('#back').disabled = !webview.canGoBack();
  document.querySelector('#forward').disabled = !webview.canGoForward();
}

function handleLoadStart(event) {
  document.body.classList.add('loading');
  if (process.env.OPEN_DEV_TOOLS) {
    document.querySelector('webview').openDevTools();
  }
  isLoading = true;

  resetExitedState();
}

function handleLoadStop(event) {
  // We don't remove the loading class immediately, instead we let the animation
  // finish, so that the spinner doesn't jerkily reset back to the 0 position.
  isLoading = false;
  checkSignInState();
}

function handleLoadAbort(event) {
  console.log('LoadAbort');
  console.log('  url: ' + event.url);
  console.log('  isTopLevel: ' + event.isTopLevel);
  console.log('  type: ' + event.type);
}

function handleLoadRedirect(event) {
  resetExitedState();
}
