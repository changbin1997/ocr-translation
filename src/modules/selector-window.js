const {BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const screenshotDesktop = require('screenshot-desktop');

module.exports = () => {
  return new Promise( resolve => {
    // 截图
    screenshotDesktop().then(img => {
      // 创建一个新窗口
      const selectorWindow = new BrowserWindow({
        fullscreen: true,
        autoHideMenuBar: true,
        alwaysOnTop: true,
        webPreferences: {
          contextIsolation: true,
          webSecurity: false,
          preload: path.normalize(path.join(__dirname, '../preload.js'))
        }
      });

      selectorWindow.loadFile(path.normalize(path.join(__dirname, '../selector-window/index.html')));

      // 把图片发送到新窗口
      selectorWindow.webContents.on('did-finish-load', () => {
        selectorWindow.webContents.send('img', img);
      });

      // 新窗口框选完成后就关闭新窗口
      ipcMain.handleOnce('complete', (ev, args) => {
        selectorWindow.close();
        resolve(args);
      });
    }).catch(error => {
      resolve({result: 'error', msg: error.message});
    });
  });
}