const {dialog, ipcMain, BrowserWindow, clipboard, shell} = require('electron');
const Ocr = require('./Ocr');  // OCR 模块
const BaiduTranslation = require('./BaiduTranslation');  // 百度翻译模块
const Data = require('./Data');  // 数据库操作模块
const ContextMenu = require('./contextMenu');  // 上下文菜单模块
const selectorWindow = require('./selector-window');

// 打开屏幕区域选择窗口
ipcMain.handle('selector-window',  async () => {
  return await selectorWindow();
});

// 显示对话框
ipcMain.handle('dialog', async (ev, args) => {
  return dialog[args.name](BrowserWindow.getFocusedWindow(), args.options);
});

// 是否是图片文件
ipcMain.handle('isImage',  (ev, args) => {
  return Ocr.isImage(args);
});

// 图片转 base64
ipcMain.handle('fileToBase64', (ev, args) => {
  return Ocr.fileToBase64(args);
});

// OCR识别
ipcMain.handle('ocr', async (ev, args) => {
  const ocr = new Ocr(args.options);
  // 是否是讯飞 OCR
  if (args.provider === 'xunfei') {
    return await ocr.xunfei(args.type, args.base64File, args.imgType);
  }else {
    return await ocr[args.provider](args.type, args.base64File);
  }
});

// 拷贝文本到剪贴板
ipcMain.handle('copy-text', (ev, args) => {
  clipboard.writeText(args);
});

// 百度翻译
ipcMain.handle('translation', async (ev, args) => {
  const baiduTranslation = new BaiduTranslation(args.options);
  return await baiduTranslation.send(args.q, args.from, args.to);
});

// 获取选项
ipcMain.handle('getOptions', async () => {
  const data = new Data();
  return await data.getOptions();
});

// 保存选项
ipcMain.handle('updateOptions', async (ev, args) => {
  const data = new Data();
  return await data.updateOptions(args);
});

// 获取 OCR 记录总览
ipcMain.handle('ocrHistoryOverview', async () => {
  const data = new Data();
  const baiduData = await data.getBaiduOcrHistoryOverview();
  const tencentData = await data.getTencentOcrHistoryOverview();
  const xunfeiData = await data.getXunfeiOcrHistoryOverview();
  const youdaoData = await data.getYoudaoOcrHistoryOverview();

  return {
    baidu: baiduData,
    tencent: tencentData,
    xunfei: xunfeiData,
    youdao: youdaoData
  };
});

// 获取 OCR 历史记录
ipcMain.handle('ocrHistoryList',  async (ev, args) => {
  const data = new Data();
  return await data.getOcrHistoryList(args.start, args.count);
});

// 获取翻译数据总览
ipcMain.handle('translationHistoryOverview', async () => {
  const data = new Data();
  return await data.getTranslationHistoryOverview();
});

// 获取翻译历史记录数据
ipcMain.handle('translationHistoryList', async (ev, args) => {
  const data = new Data();
  return await data.getTranslationHistoryList(args.start, args.count);
});

// 清空翻译历史记录
ipcMain.handle('deleteAllTranslationHistory', async () => {
  const data = new Data();
  return await  data.deleteAllTranslationHistory();
});

// 清空指定提供商的 OCR 历史记录
ipcMain.handle('deleteOcrHistory', async (ev, args) => {
  const data = new Data();
  return await data.deleteAllOcrHistory(args);
});

// 上下文菜单请求
ipcMain.on('contextMenu', (ev, args) => {
  // 弹出上下文菜单
  ContextMenu.inputMenu(args.x, args.y);
});

// 导出翻译结果菜单请求
ipcMain.on('exportTranslationMenu', (ev, args) => {
  // 弹出用于导出翻译结果的菜单
  ContextMenu.exportTranslationMenu(args.x, args.y, args.result);
});

// 导出 OCR 识别结果菜单请求
ipcMain.on('exportOcrMenu', (ev, args) => {
  // 弹出用于导出翻译结果的菜单
  ContextMenu.exportOcrMenu(args.x, args.y, args.result);
});

// 通过浏览器打开链接地址
ipcMain.on('openLink', (ev, args) => {
  shell.openExternal(args);
});

// 添加收藏
ipcMain.handle('addToFavorites', async (ev, args) => {
  const data = new Data();
  return await data.addToFavorites(args);
});

// 获取收藏
ipcMain.handle('getFavorites', async (ev, args) => {
  const data = new Data();
  return await data.getFavorites(args);
});

// 删除收藏
ipcMain.handle('deleteFavorite', async (ev, args) => {
  const data = new Data();
  return await data.deleteFavorite(args);
});