const { app, BrowserWindow, globalShortcut, dialog, Menu, Tray } = require('electron');
const path = require('path');
const ScreenshotOcr = require('./modules/screenshotOcr'); // 截图模块
const Data = require('./modules/Data'); // 数据库操作模块

// 数据库初始化
const data = new Data();

let mainWindow; // 用来保存主窗口对象的引用
let disabled = false; // 用于禁用截图识别
let tray = null;  // 用来存储系统托盘

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
  if (app.isPackaged) {
    Menu.setApplicationMenu(null);
  }

  // 加载页面文件
  if (app.isPackaged) {
    // 如果是打包好的就加载打包的 HTML 文件
    mainWindow.loadFile('dist/index.html');
  } else {
    // 如果没有打包就直接从本地服务器加载
    mainWindow.loadURL('http://localhost:9999/');
  }

  // 关闭事件
  mainWindow.on('closed', () => {
    globalShortcut.unregisterAll();
    mainWindow = null;
  });

  // 如果无法打开数据库
  if (data.dbErr !== null) {
    await dialog.showMessageBox(mainWindow, {
      title: '无法初始化数据库',
      message: '无法打开和初始化数据库，程序无法正常运行！',
      type: 'error',
      buttons: ['退出程序'],
      noLink: true
    });
    // 退出软件
    app.quit();
  }

  // 数据库初始化
  const initResult = await data.init();
  // 出错
  if (initResult.result !== 'success') {
    await dialog.showMessageBox(mainWindow, {
      title: '数据库初始化错误',
      message: initResult.msg,
      type: 'error',
      buttons: ['退出程序'],
      noLink: true
    });
    // 退出软件
    app.quit();
  }

  // 初始化快捷键截图识别
  let options = await data.getOptions();
  // 出错
  if (options.result !== 'success') {
    await dialog.showMessageBox(mainWindow, {
      title: '查询数据出错！',
      message: options.msg,
      type: 'error',
      buttons: ['退出程序'],
      noLink: true
    });
    // 退出软件
    app.quit();
  }
  const screenshotOcr = new ScreenshotOcr(options.options);
  // 如果开启了全局快捷键1
  if (options.options.key1Enable) {
    // 快捷键1事件
    globalShortcut.register(options.options.key1Name, async () => {
      if (disabled) return false;
      disabled = true; // 正在识别时禁用截图
      const result = await screenshotOcr.ocr(
        options.options.key1Provider,
        options.options.key1Function
      );
      disabled = false; // 识别完成后恢复截图
      // 取消截图
      if (result === null) return false;
      if (result.result !== 'success') {
        await dialog.showMessageBox(mainWindow, {
          title:'OCR 识别出错',
          message: result.msg,
          type: 'error',
          buttons: ['关闭'],
          noLink: true
        });
        return false;
      }
      mainWindow.webContents.send('ocrResult', result);
    });
  }
  // 如果开启了全局快捷键2
  if (options.options.key2Enable) {
    // 快捷键2事件
    globalShortcut.register(options.options.key2Name, async () => {
      if (disabled) return false;
      disabled = true; // 正在识别时禁用截图
      const result = await screenshotOcr.ocr(
        options.options.key2Provider,
        options.options.key2Function
      );
      disabled = false; // 识别完成后恢复截图
      // 取消截图
      if (result === null) return false;
      if (result.result !== 'success') {
        await dialog.showMessageBox(mainWindow, {
          title: 'OCR 识别出错',
          message: result.msg,
          type: 'error',
          buttons: ['关闭'],
          noLink: true
        });
        return false;
      }
      mainWindow.webContents.send('ocrResult', result);
    });
  }
  // 如果开启了指定区域识别
  if (options.options.specificArea) {
    globalShortcut.register(options.options.specificAreaKeyName, async () => {
      if (disabled) return false;
      disabled = true; // 正在识别时禁用截图
      // 调用截取指定区域识别
      const result = await screenshotOcr.specificArea(
        options.options.specificAreaProvider,
        options.options.specificAreaApi,
        options.options.specificAreaLeft,
        options.options.specificAreaTop,
        options.options.specificAreaWidth,
        options.options.specificAreaHeight
      );
      disabled = false; // 识别完成后恢复截图
      // 识别出错
      if (result.result !== 'success') {
        await dialog.showMessageBox(mainWindow, {
          title: 'OCR 识别出错',
          message: result.msg,
          type: 'error',
          buttons: ['关闭'],
          noLink: true
        });
        return false;
      }
      mainWindow.webContents.send('ocrResult', result);
    });
  }

  // 创建托盘图标菜单
  tray = new Tray(path.join(__dirname, 'icon.ico'));
  // 菜单模板
  const trayMenu = [
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow.isVisible()) return false;
        mainWindow.show();
      }
    },
    {
      label: '退出',
      role: 'quit'
    }
  ];
  // 创建菜单
  tray.setContextMenu(Menu.buildFromTemplate(trayMenu));
  // 托盘图标设置提示文字
  tray.setToolTip(`OCR识别翻译\n${options.options.key1Name}：${options.options.key1Function}\n${options.options.key2Name}：${options.options.key2Function}`);
  // 托盘图标点击
  tray.on('click', () => {
    if (mainWindow.isVisible()) return false;
    mainWindow.show();
  });

  // 窗口最小化
  mainWindow.on('minimize', () => {
    mainWindow.hide();
  });
});

// 用于处理 IPC 请求
require('./modules/ipc');
