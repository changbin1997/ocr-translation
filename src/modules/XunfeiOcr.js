const crypto = require('crypto');
const axios = require('axios').default;

module.exports = class XunfeiOcr {
  host = 'api.xf-yun.com';  // 请求主机
  urlPath = '/v1/private/sf8e6aca1';  // 地址路径
  date = null;  // 时间戳
  APPId = '';
  APISecret = '';
  APIKey = '';

  constructor(APPId, APISecret, APIKey) {
    this.APPId = APPId;
    this.APISecret = APISecret;
    this.APIKey = APIKey;
  }

  // 发送请求
  submit(base64Img, imgType) {
    // 要提交的数据
    const submitData = {
      header: { app_id: this.APPId, status: 3 },
      parameter: {
        sf8e6aca1: {
          category: 'ch_en_public_cloud',
          result: {
            encoding: 'utf8',
            compress: 'raw',
            format: 'json'
          }
        }
      },
      payload: {
        sf8e6aca1_data_1: {
          encoding: imgType,
          status: 3,
          image: base64Img
        }
      }
    };
    // 获取 authorization
    const authorization = this.getAuthorization();
    const url = `https://${this.host}${this.urlPath}?authorization=${authorization}&host=${this.host}&date=${this.date}`;
    return new  Promise(resolve => {
      axios({
        url: url,
        method: 'post',
        data: JSON.stringify(submitData),
        timeout: 15000,
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(result => {
        // 识别出错
        if (result.data.header.message !== 'success') {
          resolve({
            msg: result.data.header.message,
            code: result.data.header.code
          });
          return false;
        }

        // 获取识别结果
        let text = Buffer.from(result.data.payload.result.text, 'base64').toString('utf-8');
        // 把识别结果转换为对象
        text = JSON.parse(text);
        const textList = [];
        // 获取每一行的文字
        text.pages[0].lines.forEach(val => {
          textList.push(val.words[0].content);
        });
        // 如果没有识别到内容就不返回
        if (textList.length < 1) {
          resolve({code: 0, msg: '没有识别到任何文字！'});
        }else {
          resolve(textList);
        }
      }).catch(error => {
        resolve({
          msg: error.response.data.message !== undefined ? error.response.data.message : error.message,
          code: error.response.status
        });
      });
    });
  }

  // 生成 authorization
  getAuthorization() {
    // 生成时间戳，RFC1123格式("EEE, dd MMM yyyy HH:mm:ss z")
    this.date = new Date().toUTCString();
    // 生成 signature
    let signature = `host: ${this.host}\ndate: ${this.date}\nPOST ${this.urlPath} HTTP/1.1`;
    // 使用 hmac-sha256 算法结合 apiSecret 对 signature 签名
    signature = crypto.createHmac('sha256', this.APISecret).update(signature).digest('base64');
    // 拼接 authorization
    const authorization = `api_key="${this.APIKey}", algorithm="hmac-sha256", headers="host date request-line", signature="${signature}"`;
    // authorization base64编码
    return Buffer.from(authorization).toString('base64');
  }
}