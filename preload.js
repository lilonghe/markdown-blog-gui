// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.

const { ipcRenderer, dialog, remote } = require('electron')

window.addEventListener('DOMContentLoaded', () => {
  document.querySelector('#root-dir-choose-btn').addEventListener('click', () => {
    ipcRenderer.send('chooseRootDir')
  });
})
