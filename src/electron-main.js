const {app, BrowserWindow, globalShortcut, dialog, Menu} = require('electron');
const path = require('path');
const ScreenshotOcr = require('./modules/screenshotOcr');  // 截图模块
const Data = require('./modules/Data');  // 数据库操作模块

// 数据库初始化
const data = new Data();

let mainWindow;  // 用来保存主窗口对象的引用

// 当 Electron 完成初始化并准备创建浏览器窗口时被调用
app.on('ready', async () => {
  // 创建主窗口
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 720,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      textAreasAreResizable: false,
      spellcheck: false,
      webSecurity: false
    }
  });

  // 隐藏菜单栏
  Menu.setApplicationMenu(null);

  // 加载页面文件
  if (app.isPackaged) {
    // 如果是打包好的就加载打包的 HTML 文件
    mainWindow.loadFile('dist/index.html');
  }else {
    // 如果没有打包就直接从本地服务器加载
    mainWindow.loadURL('http://localhost:9999/');
  }
  

  // 关闭事件
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 如果无法打开数据库
  if (data.dbErr !== null) {
    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      title: '无法初始化数据库',
      message: '无法打开和初始化数据库，程序无法正常运行！',
      type: 'error',
      buttons: ['退出程序'],
      noLink: true
    }).then(() => {
      // 退出软件
      app.quit();
    });
  }
  // 数据库初始化
  data.init().then(async () => {
    let options = await data.getOptions();
    const screenshotOcr = new ScreenshotOcr(options);

    // 如果开启了 F1 全局快捷键
    if (options.keyF1Enable) {
      // F1快捷键事件
      globalShortcut.register('F1', async () => {
        const result = await screenshotOcr.ocr(options.keyF1Provider, options.keyF1Function);
        if (result === null) return false;
        mainWindow.webContents.send('ocrResult', result);
      });
    }
    // 如果开启了 F2 全局快捷键
    if (options.keyF2Enable) {
      // F2快捷键事件
      globalShortcut.register('F2', async () => {
        const result = await screenshotOcr.ocr(options.keyF2Provider, options.keyF2Function);
        if (result === null) return false;
        mainWindow.webContents.send('ocrResult', result);
      });
    }
  }).catch(error => {
    dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
      title: '错误：' + error.errno,
      message: error.code,
      type: 'error',
      buttons: ['退出程序'],
      noLink: true
    }).then(() => {
      // 退出软件
      app.quit();
    });
  });
});

// 用于处理 IPC 请求
require('./modules/ipc');
const {as} = require("tencentcloud-sdk-nodejs/tencentcloud");