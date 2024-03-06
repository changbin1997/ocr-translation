<template>
  <div id="options-page">
    <div class="options-box p-3">
      <!--百度 OCR 接口-->
      <p class="mb-2"><b>百度 OCR 接口</b></p>
      <div aria-label="百度 OCR 接口" role="group">
        <div class="mb-3">
          <label for="baidu-app-id" class="form-label">App ID</label>
          <input type="text" id="baidu-app-id" class="form-control" placeholder="百度 OCR 的 App ID" v-model="optionsSelected.baiduOcrAppID">
        </div>
        <div class="mb-3">
          <label for="baidu-api-key" class="form-label">API Key</label>
          <input type="text" id="baidu-api-key" class="form-control" placeholder="百度 OCR 的 API Key" v-model="optionsSelected.baiduOcrApiKey">
        </div>
        <div class="mb-3">
          <label for="baidu-secret-key" class="form-label">Secret Key</label>
          <input type="text" id="baidu-secret-key" class="form-control" placeholder="百度 OCR 的 Secret Key" v-model="optionsSelected.baiduOcrSecretKey">
        </div>
      </div>
      <div class="mb-4"></div>
      <!--腾讯 OCR 接口-->
      <p class="mb-2"><b>腾讯 OCR 接口</b></p>
      <div aria-label="腾讯 OCR 接口" role="group">
        <div class="mb-3">
          <label for="tencent-app-id" class="form-label">App ID</label>
          <input type="text" id="tencent-app-id" class="form-control" placeholder="腾讯 OCR 的 App ID" v-model="optionsSelected.tencentOcrAppID">
        </div>
        <div class="mb-3">
          <label for="tencent-secret-id" class="form-label">Secret ID</label>
          <input type="text" id="tencent-secret-id" class="form-control" placeholder="腾讯 OCR 的 Secret ID" v-model="optionsSelected.tencentOcrSecretID">
        </div>
        <div class="mb-3">
          <label for="tencent-secret-key" class="form-label">Secret Key</label>
          <input type="text" id="tencent-secret-key" class="form-control" placeholder="腾讯 OCR 的 Secret Key" v-model="optionsSelected.tencentOcrSecretKey">
        </div>
      </div>
      <div class="mb-4"></div>
      <!--讯飞 OCR 接口-->
      <p class="mb-2"><b>科大讯飞 OCR 接口</b></p>
      <div aria-label="科大讯飞 OCR 接口" role="group">
        <div class="mb-3">
          <label for="xunfei-app-id" class="form-label">App ID</label>
          <input type="text" id="xunfei-app-id" class="form-control" placeholder="科大讯飞 OCR 的 App ID" v-model="optionsSelected.xunfeiOcrAPPId">
        </div>
        <div class="mb-3">
          <label for="xunfei-secret" class="form-label">Secret</label>
          <input type="text" id="xunfei-secret" class="form-control" placeholder="科大讯飞 OCR 的 Secret" v-model="optionsSelected.xunfeiOcrAPISecret">
        </div>
        <div class="mb-3">
          <label for="xunfei-api-key" class="form-label">API Key</label>
          <input type="text" id="xunfei-api-key" class="form-control" placeholder="科大讯飞 OCR 的 API Key" v-model="optionsSelected.xunfeiOcrAPIKey">
        </div>
      </div>
      <div class="mb-4"></div>
      <!--百度翻译接口-->
      <p class="mb-2"><b>百度翻译接口</b></p>
      <div aria-label="百度翻译接口" role="group">
        <div class="mb-3">
          <label for="baidu-translation-app-id" class="form-label">App ID</label>
          <input type="text" id="baidu-translation-app-id" class="form-control" placeholder="百度翻译的 App ID" v-model="optionsSelected.baiduTranslationAppID">
        </div>
        <div class="mb-3">
          <label for="baidu-translation-api-key" class="form-label">API Key</label>
          <input type="text" id="baidu-translation-api-key" class="form-control" placeholder="百度翻译的 API Key" v-model="optionsSelected.baiduTranslationApiKey">
        </div>
      </div>
      <div class="mb-4"></div>
      <!--OCR语音设置-->
      <p class="mb-2"><b>OCR 语音朗读设置</b></p>
      <div aria-label="OCR语音朗读" role="group">
        <div class="mb-3">
          <label for="ocr-volume" class="form-label">语音音量</label>
          <input type="range" class="form-range" id="ocr-volume" max="10" min="1" v-model="optionsSelected.ocrVoiceVolume">
        </div>
        <div class="mb-3">
          <label for="ocr-speed" class="form-label">语音语速</label>
          <input type="range" class="form-range" id="ocr-speed" max="10" min="1" v-model="optionsSelected.ocrVoiceSpeed">
        </div>
        <div class="mb-3">
          <label for="ocr-voice-library" class="form-label">发音人</label>
          <select id="ocr-voice-library" class="form-select" v-model="optionsSelected.ocrVoiceLibrarySelected">
            <option v-for="(item, index) of voiceLibraryList" :key="index" v-bind:value="item.name">{{item.name}} {{item.lang}}</option>
          </select>
        </div>
        <div class="mb-3">
          <button type="button" class="btn btn-outline-primary" @click="voiceTest">测试语音朗读效果</button>
        </div>
      </div>
      <div class="mb-4"></div>
      <!--快捷键-->
      <p class="mb-2"><b>全局快捷键</b></p>
      <div aria-label="快捷键" role="group">
        <!--F1快捷键-->
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="key-f1" v-model="optionsSelected.keyF1Enable">
            <label class="form-check-label" for="key-f1">启用 F1 全局快捷键</label>
          </div>
        </div>
        <div class="mb-3">
          <label for="key-f1-function" class="form-label">F1 快捷键的功能</label>
          <select id="key-f1-function" class="form-select" v-model="optionsSelected.keyF1Function" :disabled="!optionsSelected.keyF1Enable">
            <option v-for="(item, index) of hotKeyFunction" :key="index" v-bind:value="item.name">{{item.name}}</option>
          </select>
        </div>
        <!--F2快捷键-->
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="key-f2" v-model="optionsSelected.keyF2Enable">
            <label class="form-check-label" for="key-f2">启用 F2 全局快捷键</label>
          </div>
        </div>
        <div class="mb-3">
          <label for="key-f2-function" class="form-label">F2 快捷键的功能</label>
          <select id="key-f2-function" class="form-select" v-model="optionsSelected.keyF2Function" :disabled="!optionsSelected.keyF2Enable">
            <option v-for="(item, index) of hotKeyFunction" :key="index" v-bind:value="item.name">{{item.name}}</option>
          </select>
        </div>
      </div>
      <div class="mb-4"></div>
      <p class="mb-2"><b>自动执行</b></p>
      <div aria-label="自动执行" role="group">
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="ocr-auto-voice" v-model="optionsSelected.ocrAutoVoice" @change="optionsSelected.autoTranslation = false">
            <label class="form-check-label" for="ocr-auto-voice">OCR识别完成后自动朗读</label>
          </div>
        </div>
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="translation-auto-voice" v-model="optionsSelected.translationAutoVoice">
            <label class="form-check-label" for="translation-auto-voice">翻译完成后自动朗读译文内容</label>
          </div>
        </div>
        <div class="mb-3">
          <div class="form-check">
            <input class="form-check-input" type="checkbox" value="" id="auto-translation" v-model="optionsSelected.autoTranslation" @change="optionsSelected.ocrAutoVoice = false">
            <label class="form-check-label" for="auto-translation">OCR识别完成后自动翻译</label>
          </div>
        </div>
      </div>
      <div class="mb-4"></div>
      <div>
        <button type="button" class="btn btn-primary" @click="saveOptions" :disabled="disabledSaveBtn">保存设置</button>
      </div>
      <div class="mb-4"></div>
      <p><b>小提示：</b></p>
      <ol>
        <li>中文发音人可以朗读中文和英文</li>
        <li>英文发音人只能朗读英文</li>
        <li>OCR 识别完成后自动朗读和自动翻译不能同时开启，开启自动翻译后 OCR 自动朗读会被取消</li>
      </ol>
    </div>
  </div>
</template>

<script>
import Voice from './../modules/voice';

export default {
  name: 'options-page',
  data() {
    return {
      optionsSelected: {
        xunfeiOcrAPPId: '',
        xunfeiOcrAPISecret: '',
        xunfeiOcrAPIKey: '',
        baiduOcrAppID: '',
        baiduOcrApiKey : '',
        baiduOcrSecretKey: '',
        tencentOcrAppID: '',
        tencentOcrSecretID: '',
        tencentOcrSecretKey: '',
        baiduTranslationAppID: '',
        baiduTranslationApiKey: '',
        ocrVoiceSpeed: 2,
        ocrVoiceVolume: 10,
        ocrVoiceLibrarySelected: '',
        keyF1Enable: false,
        keyF1Function: '百度通用OCR识别',
        keyF1Provider: 'baidu',
        keyF2Enable: false,
        keyF2Function: '腾讯云通用印刷体识别',
        keyF2Provider: 'tencent',
        ocrAutoVoice: false,
        translationAutoVoice: false,
        autoTranslation: false
      },
      voiceLibraryList: [],
      hotKeyFunction: [
        {provider: 'baidu', name: '百度通用OCR识别'},
        {provider: 'baidu', name: '百度高精度OCR识别'},
        {provider: 'tencent', name: '腾讯云通用印刷体识别'},
        {provider: 'tencent', name: '腾讯云通用印刷体识别（高精度版）'},
        {provider: 'tencent', name: '腾讯云通用手写体识别'},
        {provider: 'tencent', name: '腾讯云广告文字识别'},
        {provider: 'xunfei', name: '科大讯飞通用文字识别'}
      ],
      synth: null,
      disabledSaveBtn: false
    }
  },
  methods: {
    // 测试语音朗读效果
    voiceTest(ev) {
      const text = '你好，很高兴认识你。Hello, Nice to meet you.';  // 语音测试朗读的内容
      // 语音设置配置
      const voiceOptions = {
        volume: this.optionsSelected.ocrVoiceVolume / 10,
        speed: this.optionsSelected.ocrVoiceSpeed,
        voiceLibrary: this.optionsSelected.ocrVoiceLibrarySelected
      };

      const voice = new Voice(voiceOptions);
      // 延迟开始朗读
      setTimeout(() => {
        // 开始朗读
        voice.start({
          text: text,
          // 朗读开始
          start: () => {
            ev.target.disabled = true;
          },
          // 朗读停止
          stop: () => {
            ev.target.disabled = false;
          }
        });
      }, 300);
    },
    // 加载语音库列表
    loadVoiceLibraryList() {
      this.synth = window.speechSynthesis;
      // 延迟获取语音库
      setTimeout(() => {
        // 获取语音库
        this.voiceLibraryList = this.synth.getVoices();
        // 如果已经设置了语音库就返回，否则就找出一个中文语音库作为默认选中的语音库
        if (this.optionsSelected.ocrVoiceLibrarySelected !== '') return false;
        // 找出一个中文语音库作为默认选中的语音库
        for (let i = 0;i < this.voiceLibraryList.length;i ++) {
          if (this.optionsSelected.ocrVoiceLibrarySelected === '' && this.voiceLibraryList[i].lang === 'zh-CN') {
            this.optionsSelected.ocrVoiceLibrarySelected = this.voiceLibraryList[i].name;
            break;
          }
        }
      }, 30);
    },
    // 保存设置
    saveOptions() {
      // 要保存的数据
      const submitData = this.optionsSelected;
      // 设置全局快捷键调用的提供商
      this.hotKeyFunction.forEach(item => {
        if (this.optionsSelected.keyF1Function === item.name) {
          submitData.keyF1Provider = item.provider;
        }
        if (this.optionsSelected.keyF2Function === item.name) {
          submitData.keyF2Provider = item.provider;
        }
      });
      // 更新 Vuex 存储的选项
      this.$store.commit('changeOptions', submitData);
      // 禁用保存按钮
      this.disabledSaveBtn = true;
      // 发送保存请求
      window.electronAPI.ipcRenderer.invoke('updateOptions', submitData).then(count => {
        // 恢复保存按钮
        this.disabledSaveBtn = false;
        window.electronAPI.ipcRenderer.invoke('dialog', {
          name: 'showMessageBox',
          options: {
            title: '已成功保存',
            message: `您更改的 ${count} 个选项已成功保存，如果更改了全局快捷键设置，需要重启软件才会生效。`,
            buttons: ['关闭'],
            type: 'info',
            noLink: true
          }
        });
      })
    }
  },
  created() {
    document.title = '选项';
    // 获取选项
    this.optionsSelected = this.$store.state.options;
    // 加载语音库
    this.loadVoiceLibraryList();
  }
}
</script>

<style scoped>
#options-page {
  height: 100%;
}
#options-page .options-box {
  max-height: 100%;
  overflow-y: auto;
}
#options-page p,#options-page label {
  -webkit-user-select: none;
  user-select: none;
}
</style>