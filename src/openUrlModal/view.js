/** @file Render process code for the "Open URL..." dialog */
const {ipcRenderer} = require('electron');
const {URL} = require('url');
const {REQUEST_NAVIGATION} = require('../channelNames');
const {openUrlInDefaultBrowser} = require('../originWhitelist');

function onLoad() {
  document.removeEventListener('DOMContentLoaded', onLoad);

  const urlInput = document.getElementById('url-input');
  const errorFeedback = document.getElementById('error-feedback');
  const goButton = document.getElementById('go-button');

  /**
   * Check the current URL input value.  Enable/disable the GO button depending
   * on whether any valid input is available, and display hints
   * @returns {boolean} true if navigation is possible, false if not.
   */
  const checkUrl = () => {
    if (urlInput.value.length === 0) {
      errorFeedback.textContent = '';
      goButton.disabled = true;
      return false;
    }

    try {
      // This constructor throws a TypeError if the URL is invalid
      // @see https://nodejs.org/api/url.html#url_constructor_new_url_input_base
      new URL(urlInput.value);
      // If we get this far we have a valid URL
      if (openUrlInDefaultBrowser(urlInput.value)) {
        errorFeedback.textContent = 'URL will open in system default browser.';
      } else {
        errorFeedback.textContent = '';
      }
      goButton.disabled = false;
      return true;
    } catch (e) {
      errorFeedback.textContent = 'Invalid URL.';
      goButton.disabled = true;
      return false;
    }
  };

  const submit = () => {
    if (!checkUrl()) {
      return;
    }

    const targetUrl = urlInput.value;
    ipcRenderer.send(REQUEST_NAVIGATION, targetUrl);
    window.close();
  };

  urlInput.addEventListener('keyup', checkUrl);
  urlInput.addEventListener('change', checkUrl);
  goButton.addEventListener('click', submit);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.close();
    } else if (event.key === 'Enter') {
      submit();
    }
  });

  urlInput.focus();
}
document.addEventListener('DOMContentLoaded', onLoad);
