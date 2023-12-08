const crypto = require('crypto');
const querystring = require('querystring');
const axios = require('axios').default;
const Data = require('./Data');

module.exports = class BaiduTranslation {
  options = null;
  data = null;

  constructor(optionsObj) {
    this.options = optionsObj;
    this.data = new Data();
  }

  // 生成签名
  signature(query, salt) {
    const signature = this.options.baiduTranslationAppID + query + salt + this.options.baiduTranslationApiKey;
    const md5 = crypto.createHash('md5');
    return md5.update(signature).digest('hex');
  }

  // 生成随机数
  rand(max, min) {
    const num = max - min;
    return Math.round(Math.random() * num + min);
  }

  // 发送翻译
  send(q, from, to) {
    // 生成一个随机数
    const randerNum = this.rand(999999, 111111);
    // 获取签名
    const sign = this.signature(q, randerNum);
    // 要发送的数据
    const submitData = {
      q: q,
      from: from,
      to: to,
      appid: this.options.baiduTranslationAppID,
      salt: randerNum,
      sign: sign
    };

    return new Promise((resolve) => {
      axios({
        url: 'https://api.fanyi.baidu.com/api/trans/vip/translate',
        method: 'post',
        data: querystring.stringify(submitData),
        timeout: 10000,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(result => {
        // 百度返回的不是 JSON 格式
        if (typeof result.data === "string") {
          resolve({
            code: 'Baidu server error',
            msg: '百度服务器返回的数据不是标准 JSON 格式！'
          });
        }

        // API出错
        if (result.data.error_code !== undefined && result.data.error_msg !== undefined) {
          resolve({
            code: result.data.error_code,
            msg: result.data.error_msg
          });
        }

        // 添加到翻译历史记录
        this.data.addTranslationHistory('baidu', q.length).then(() => {
          resolve(result.data);
        });
      }).catch(error => {
        if (error.response) {
          resolve({
            code: error.response.status,
            msg: error.response.statusText
          });
        }else {
          resolve({
            code: 0,
            msg: '翻译请求无法发送到百度服务器！'
          });
        }
      });
    });
  }
};