/** @file Render process code for the "Open URL..." dialog */
const {ipcRenderer} = require('electron');
const {REQUEST_NAVIGATION} = require('../channelNames');

function onLoad() {
  document.removeEventListener('DOMContentLoaded', onLoad);

  const goButton = document.getElementById('go-button');
  const urlInput = document.getElementById('url-input');

  const submit = () => {
    const targetUrl = urlInput.value;
    ipcRenderer.send(REQUEST_NAVIGATION, targetUrl);
    window.close();
  };

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
