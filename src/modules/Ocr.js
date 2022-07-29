const AipOcrClient = require('baidu-aip-sdk').ocr;
const OcrClient = require('tencentcloud-sdk-nodejs').ocr.v20181119.Client;
const fs = require('fs');
const path = require('path');
const Data = require('./Data');

module.exports = class Ocr {
  options = null;
  data = null;

  constructor(optionsObj) {
    this.options = optionsObj;
    this.data = new Data();
  }

  // 百度 OCR 识别
  baidu(type, base64File) {
    const client = new AipOcrClient(this.options.baiduOcrAppID, this.options.baiduOcrApiKey, this.options.baiduOcrSecretKey);

    let result = null;
    if (type === '百度通用OCR识别') {
      // 通用文字识别
      result = client.generalBasic(base64File);
    } else {
      result = client.accurateBasic(base64File);
    }
    // 调整返回的内容
    return new Promise((resolve) => {
      result.then(data => {
        // 添加 OCR 历史记录
        this.data.addOcrHistory('baidu', type).then(() => {
          // 只返回识别内容数组
          const resultList = [];
          data.words_result.forEach(item => {
            resultList.push(item.words);
          });
          resolve(resultList);
        });
      }).catch(error => {
        resolve({
          msg: error.error_msg,
          code: error.error_code
        });
      })
    });
  }

  // 腾讯 OCR 识别
  tencent(type, base64File) {
    const client = new OcrClient({
      credential: {
        secretId: this.options.tencentOcrSecretID,
        secretKey: this.options.tencentOcrSecretKey
      },
      region: 'ap-guangzhou'
    });
    // 用来存储识别结果
    let result = null;
    // 根据传入的识别类型调用识别
    switch (type) {
      case '腾讯云通用印刷体识别':
        result = client.GeneralBasicOCR({ImageBase64: base64File});
        break;
      case '腾讯云通用印刷体识别（高精度版）':
        result = client.GeneralAccurateOCR({ImageBase64: base64File});
        break;
      case '腾讯云通用手写体识别':
        result = client.GeneralHandwritingOCR({ImageBase64: base64File});
        break;
      default:
        result = client.AdvertiseOCR({ImageBase64: base64File});
        break;
    }
    // 处理识别结果并返回
    return new Promise((resolve) => {
      result.then(data => {
        // 添加 OCR 历史记录
        this.data.addOcrHistory('tencent', type).then(() => {
          // 把识别结果封装为数组返回
          const resultList = [];
          data.TextDetections.forEach(item => {
            resultList.push(item.DetectedText);
          });
          resolve(resultList);
        });
      }).catch(() => {
        resolve({
          code: 'error',
          msg: '请检查 appID、secretID、secretKey 是否有错误，相关功能是否开通！'
        });
      })
    });
  }

  // 读取文件并转换为 base64
  static fileToBase64(fileName) {
    return fs.readFileSync(fileName).toString('base64');
  }

  // 检查是否是图片
  static isImage(fileName) {
    const extnameList = ['.jpg', '.png', '.jpeg'];
    const extname = path.extname(fileName);
    return extnameList.indexOf(extname) >= 0;
  }
}