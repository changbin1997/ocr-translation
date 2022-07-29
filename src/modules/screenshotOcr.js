const path = require('path');
const fs = require('fs');
const child_process = require('child_process');
const {clipboard, dialog, BrowserWindow} = require('electron');
const Ocr = require('./Ocr');

module.exports = class ScreenshotOcr {
  options = null;  // 选项
  available = {baidu: false, tencent: false};  // 功能可用性
  providerList = {baidu: '百度', tencent: '腾讯'};  // OCR 提供商名称

  constructor(options) {
    this.options = options;
    // 检查 百度 OCR API 是否可用
    if (
      this.options.baiduOcrAppID !== '' &&
      this.options.baiduOcrApiKey !== '' &&
      this.options.baiduOcrSecretKey !== ''
    ) {
      this.available.baidu = true;
    }
    // 检查腾讯 OCR API 是否可用
    if (
      this.options.tencentOcrAppID !== '' &&
      this.options.tencentOcrSecretID !== '' &&
      this.options.tencentOcrSecretKey !== ''
    ) {
      this.available.tencent = true;
    }
  }

  // 识别
  ocr(provider, ocrType) {
    return new Promise((resolve) => {
      // 检查接口是否可用
      if (!this.available[provider]) {
        dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
          title: `没有填写${this.providerList[provider]} API 密钥`,
          message: `您还没有填写${this.providerList[provider]} API 密钥信息，${ocrType} 目前暂不可用！`,
          type: 'info',
          buttons: ['关闭'],
          noLink: true
        });
        resolve(null);
        return false;
      }
      // 调用截图
      this.screenshot().then(img => {
        const ocr = new Ocr(this.options);
        ocr[provider](ocrType, img).then(result => {
          if (result.code !== undefined && result.msg !== undefined) {
            dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
              title: '错误：' + result.code,
              message: result.msg,
              type: 'error',
              buttons: ['关闭'],
              noLink: true
            });
            resolve(null);
            return false;
          }
          resolve({
            img: img,
            text: result
          });
        });
      }).catch(error => {
        if (typeof error === "string") {
          dialog.showMessageBox(BrowserWindow.getFocusedWindow(), {
            title: '出错了',
            message: error,
            type: 'error',
            buttons: ['关闭'],
            noLink: true
          });
        }
      });
    });
  }

  // 截图
  screenshot() {
    return new Promise((resolve, reject) => {
      // 截图 dll 位置
      const screenshotModule = {
        dll: path.join(process.cwd(), 'dll', 'PrScrn.dll'),
        exe: path.join(process.cwd(), 'dll', 'PrintScr.exe')
      };
      // 检测截图 exe 是否存在
      fs.exists(screenshotModule.exe, exists => {
        // 如果截图 exe 不存在就直接返回
        if (!exists) {
          reject('找不到 ' + screenshotModule.exe + ' 文件！');
          return false;
        }
        // 检测截图 dll 是否存在
        fs.exists(screenshotModule.dll, dllExists => {
          if (!dllExists) {
            reject('找不到 ' + screenshotModule.dll + ' 文件！');
            return false;
          }
          // 打开截图程序
          const screenWindow = child_process.execFile(screenshotModule.exe);
          // 截图程序被关闭
          screenWindow.on('exit', code => {
            // 是否成功截图
            if (code) {
              // 从剪贴板读取图片
              let img = clipboard.readImage();
              // 把图片转为 base64
              img = img.toPNG().toString('base64');
              resolve(img);
            }
          });
        });
      });
    });
  }
};