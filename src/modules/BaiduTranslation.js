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
        timeout: 15000,
        headers: {'Content-Type': 'application/x-www-form-urlencoded'}
      }).then(async result => {
        // 百度返回的不是 JSON 格式
        if (typeof result.data === "string") {
          resolve({result: 'error', msg: '百度翻译服务器未能返回翻译数据！'});
          return false;
        }

        // API出错
        if (result.data.error_code !== undefined && result.data.error_msg !== undefined) {
          resolve({ result: 'error', msg: `${result.data.error_code} ${result.data.error_msg}` });
          return  false;
        }

        // 百度服务器是否返回翻译结果
        if (result.data.trans_result === undefined || result.data.trans_result.length < 1) {
          resolve({result: 'error', msg: '百度翻译未能返回翻译结果！'});
          return false;
        }

        // 添加到翻译历史记录
        await this.data.addTranslationHistory('baidu', q.length);
        resolve({ result: 'success', data: result.data });
      }).catch(error => {
        if (error.response) {
          resolve({ result: 'error', msg: `${error.response.status} ${error.message}` });
        }else {
          resolve({result: 'error', msg: `${error.code} ${error.message}`});
        }
      });
    });
  }
};