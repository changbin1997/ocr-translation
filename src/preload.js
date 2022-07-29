const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  ipcRenderer,
  onResponse: (channel, listener) => {
    ipcRenderer.on(channel, listener);
  }
});