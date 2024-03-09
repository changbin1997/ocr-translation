const axios = require('axios').default;
const crypto = require('crypto');
const querystring = require('querystring');

module.exports = class YoudaoOcr {
  appId = null;
  appKey = null;

  constructor(appId, appKey) {
    this.appId = appId;
    this.appKey = appKey;
  }

  // 提交识别
  submit(base64Img) {
    // 获取要提交的数据
    const queryData = this.submitData(base64Img);

    return new Promise(resolve => {
      axios({
        url: 'https://openapi.youdao.com/ocrapi',
        method: 'post',
        data: queryData,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }).then(result => {
        // 是否出错
        if (result.data.errorCode !== '0' && result.data.msg !== undefined) {
          resolve({code: result.data.errorCode, msg: result.data.msg});
          return false;
        }

        const textList = [];  // 存放识别结果
        result.data.Result.regions.forEach(val => {
          textList.push(val.lines[0].text);
        });

        if (textList.length < 1) {
          resolve({code: 0, msg: '没有识别到文字！'});
        }else {
          resolve(textList);
        }
      }).catch(error => {
        resolve({code: error.response.status, msg: error.message});
      });
    });
  }

  // 生成签名
  submitData(base64Img) {
    const data = {
      // 生成 UUID
      salt: crypto.randomUUID(),
      // 语言
      langType: 'auto',
      // 按行识别：10012
      detectType: '10012',
      imageType: '1',
      appKey: this.appId,
      docType: 'json',
      signType: 'v3',
      curtime: Math.round(new Date().getTime() / 1000),
      angle: '0',
      // 是否按多列识别
      column: 'onecolumn',
      rotate: 'rotate',
      img: base64Img
    };

    // input的计算方式为：input=img前10个字符 + img长度 + img后十个字符
    const input = `${data.img.slice(0, 10)}${data.img.length}${data.img.slice(-10)}`;
    // 生成签名
    const sign = `${data.appKey}${input}${data.salt}${data.curtime}${this.appKey}`;
    data.sign = crypto.createHash('sha256').update(sign).digest('hex');
    // 把要提交的数据转换为 url query
    return querystring.stringify(data);
  }
}