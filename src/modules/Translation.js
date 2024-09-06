const Data = require('./Data');
const TmtClient = require('tencentcloud-sdk-nodejs').tmt.v20180321.Client;
const BaiduTranslation = require('./BaiduTranslation');  // 百度翻译模块
const XunfeiTranslation = require('./XunfeiTranslation');  // 讯飞翻译模块

module.exports = class Translation {
  options = null;
  data = null;

  constructor(optionsObj) {
    this.options = optionsObj;
    this.data = new Data();
  }

  // 翻译
  async translation(q, from = 'auto', to = 'zh') {
    // 根据设置的翻译接口调用翻译
    const result = await this[this.options.translationProvider](q, from, to);
    // 如果翻译成功就添加翻译记录
    if (result.result === 'success') {
      await this.data.addTranslationHistory(this.options.translationProvider, q.length);
    }

    return result;
  }

  // 百度翻译
  async baidu(q, from = 'auto', to = 'zh') {
    const baiduTranslation = new BaiduTranslation(this.options);
    return await  baiduTranslation.send(q, from, to);
  }

  // 讯飞翻译
  async xunfei(q, from = 'auto', to = 'cn') {
    const APPId = this.options.xunfeiOcrAPPId;
    const APISecret = this.options.xunfeiOcrAPISecret;
    const APIKey = this.options.xunfeiOcrAPIKey;
    const xunfeiTranslation = new XunfeiTranslation(APPId, APISecret, APIKey);
    return await xunfeiTranslation.submit(q, from, to);
  }

  // 腾讯翻译
  tencent(q, from = 'auto', to = 'zh') {
    // 腾讯翻译 API 配置信息
    const clientConfig = {
      credential: {
        secretId: this.options.tencentOcrSecretID,
        secretKey: this.options.tencentOcrSecretKey
      },
      region: this.options.tencentOcrRegionSelected
    };

    const client = new TmtClient(clientConfig);
    // 去除原文内容的空行
    q = q.replace(/^\s*[\r\n]/gm, '');
    // 要发送的内容
    const params = {
      SourceText: q,
      Source: from,
      Target: to,
      ProjectId: 0
    };

    // 发送翻译
    return new Promise(resolve => {
      client.TextTranslate(params).then(result => {
        // 使用和百度相同的格式返回翻译结果
        const returnResult = {
          from: result.Source,
          to: result.Target,
          trans_result: []
        };
        // 把原文和译文拆分为数组
        const src = q.split("\n");
        const dst = result.TargetText.split("\n");
        // 把原文和译文加入翻译结果
        for (let i = 0;i < dst.length;i ++) {
          returnResult.trans_result.push({
            src: src[i],
            dst: dst[i]
          });
        }

        resolve({result: 'success', data: returnResult});
      }).catch(error => {
        resolve({result: 'error', msg: error.message});
      })
    });
  }
}