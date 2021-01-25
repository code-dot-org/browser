/**
 * @file Render process entry point for Code.org Maker App.
 * Creates/binds browser controls, including the webview that hosts Code.org
 * curriculum.
 *
 * Process: Renderer
 */
// First step: Always be production, unless told otherwise.
if (process.env.NODE_ENV === undefined) process.env.NODE_ENV = 'production';

const {ipcRenderer, shell} = require('electron');
const electron = require('electron');
const {
  NAVIGATION_REQUESTED,
  RELOAD_REQUESTED,
  TOGGLE_DEV_TOOLS_REQUESTED,
} = require('./channelNames');
const {
  HOME_URL,
  MAKER_SETUP_URL,
  CLEVER_LOGIN_URL,
  MAKER_LOGIN_URL,
  SIGN_IN_URL,
} = require('./defaults');

window.onresize = doLayout;
var isLoading = false;

// Handle requests from Electron menu items
ipcRenderer.on(RELOAD_REQUESTED, () => {
  if (!isLoading) {
    document.querySelector('webview').reload();
  }
});
ipcRenderer.on(NAVIGATION_REQUESTED, (_, url) => navigateTo(url));
ipcRenderer.on(TOGGLE_DEV_TOOLS_REQUESTED, () => {
  const webview = document.querySelector('webview');
  if (webview.isDevToolsOpened()) {
    webview.closeDevTools();
  } else {
    webview.openDevTools();
  }
});

window.onload = function() {
  var webview = document.querySelector('webview');
  doLayout();

  document.querySelector('#back').onclick = function() {
    webview.goBack();
  };

  document.querySelector('#forward').onclick = function() {
    webview.goForward();
  };

  document.querySelector('#home').onclick = function() {
    navigateTo(HOME_URL);
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
    function() {
      if (!isLoading) {
        document.body.classList.remove('loading');
      }
    }
  );

  document.querySelector('#setup').onclick = function() {
    navigateTo(MAKER_SETUP_URL);
  };

  document.querySelector('#clever-login').onclick = function() {
    navigateTo(CLEVER_LOGIN_URL);
  };

  document.querySelector('#google-login').onclick = function() {
    // Opens link in default browser
    require('electron').shell.openExternal(SIGN_IN_URL + '?user_return_to=/maker/display_google_oauth_code&maker=true');
    navigateTo(MAKER_LOGIN_URL);
  };

  webview.addEventListener('close', handleExit);
  webview.addEventListener('did-start-loading', handleLoadStart);
  webview.addEventListener('did-stop-loading', handleLoadStop);
  webview.addEventListener('did-fail-load', handleLoadAbort);
  webview.addEventListener('did-get-redirect-request', handleLoadRedirect);
  webview.addEventListener('did-finish-load', handleLoadCommit);

  navigateTo(HOME_URL);
};

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
  sadWebview.style.height = webviewHeight * 2 / 3 + 'px';
  sadWebview.style.paddingTop = webviewHeight / 3 + 'px';
}

function handleExit(event) {
  console.log(event.type);
  document.body.classList.add('exited');
  if (event.type === 'abnormal') {
    document.body.classList.add('crashed');
  } else if (event.type === 'killed') {
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

const notificationText = {
  title: 'New Version of the Code.org Maker App Available',
  body: 'Click this notification to download the latest version of the Code.org Maker App',
};
let notification = new electron.remote.Notification(notificationText);
notification.on('click', (event, arg) => {
  shell.openExternal('https://studio.code.org/maker/setup');
});
notification.show();
