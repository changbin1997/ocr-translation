<template>
  <div id="translation-page">
    <div role="toolbar" class="toolbar px-1 bg-light">
      <!--原文操作区域-->
      <div class="btn-group btn-box">
        <button type="button" class="btn btn-smy" :disabled="originalText.length < 1 && resultText.length < 1" @click="clear">
          <i class="icon-cross me-1"></i>
          <span>清空</span>
        </button>
        <button type="button" class="btn btn-smy" :disabled="originalText.length < 1 || disabledVoiceBtn" @click="startVoice(originalText)">
          <i class="icon-volume-medium me-1"></i>
          <span>朗读</span>
        </button>
      </div>
      <!--翻译语言选择区域-->
      <div class="language-box">
        <select class="form-select form-select-sm" v-model="languageSelected1" aria-label="原文语言" title="原文语言">
          <option v-for="(item, index) of languageList1" :key="index" v-bind:value="item.code">{{item.name}}</option>
        </select>
        <button type="button" class="btn btn-sm" aria-label="翻译" title="翻译" @click="submit" :disabled="disabledSubmitBtn">
          <i class="icon-arrow-right2"></i>
        </button>
        <select class="form-select form-select-sm" v-model="languageSelected2" aria-label="译文语言" title="译文语言">
          <option v-for="(item, index) of languageList2" :key="index" v-bind:value="item.code">{{item.name}}</option>
        </select>
      </div>
      <!--译文操作区域-->
      <div class="btn-group btn-box">
        <button type="button" class="btn btn-smy" :disabled="resultText.length < 1 || disabledVoiceBtn" @click="startVoice(resultText)">
          <i class="icon-volume-medium me-1"></i>
          <span>朗读</span>
        </button>
        <button type="button" class="btn btn-smy" :disabled="resultText.length < 1" @click="copyText">
          <i class="icon-copy me-1"></i>
          <span>拷贝</span>
        </button>
      </div>
    </div>
    <!--输入和译文显示区域-->
    <div class="text-box">
      <div class="original-box">
        <textarea class="form-control border" placeholder="请输入要翻译的内容" aria-label="原文" v-model="originalText" @contextmenu="contextMenu"></textarea>
      </div>
      <div class="result-box">
        <textarea class="form-control border" aria-label="译文" v-model="resultText" aria-live="assertive" @contextmenu="contextMenu"></textarea>
      </div>
    </div>
  </div>
</template>

<script>
import Voice from './../modules/voice';

export default {
  name: 'translation-page',
  data() {
    return {
      languageSelected1: 'auto',
      languageSelected2: 'zh',
      languageList1: [
        {code: 'auto', name: '自动检测语言'},
        {code: 'zh', name: '中文'},
        {code: 'en', name: '英语'},
        {code: 'yue', name: '粤语'},
        {code: 'wyw', name: '文言文'},
        {code: 'jp', name: '日语'},
        {code: 'fra', name: '法语'},
        {code: 'spa', name: '西班牙语'},
        {code: 'th', name: '泰语'},
        {code: 'ara', name: '阿拉伯语'},
        {code: 'ru', name: '俄语'},
        {code: 'pt', name: '葡萄牙语'},
        {code: 'de', name: '德语'},
        {code: 'it', name: '意大利语'},
        {code: 'el', name: '希腊语'},
        {code: 'nl', name: '荷兰语'},
        {code: 'pl', name: '波兰语'},
        {code: 'bul', name: '保加利亚语'},
        {code: 'est', name: '爱沙尼亚语'},
        {code: 'dan', name: '丹麦语'},
        {code: 'fin', name: '芬兰语'},
        {code: 'cs', name: '捷克语'},
        {code: 'rom', name: '罗马尼亚语'},
        {code: 'slo', name: '斯洛文尼亚语'},
        {code: 'swe', name: '瑞典语'},
        {code: 'hu', name: '匈牙利语'},
        {code: 'cht', name: '繁体中文'},
        {code: 'vie', name: '越南语'}
      ],
      languageList2: [
        {code: 'zh', name: '中文'},
        {code: 'en', name: '英语'},
        {code: 'yue', name: '粤语'},
        {code: 'wyw', name: '文言文'},
        {code: 'jp', name: '日语'},
        {code: 'fra', name: '法语'},
        {code: 'spa', name: '西班牙语'},
        {code: 'th', name: '泰语'},
        {code: 'ara', name: '阿拉伯语'},
        {code: 'ru', name: '俄语'},
        {code: 'pt', name: '葡萄牙语'},
        {code: 'de', name: '德语'},
        {code: 'it', name: '意大利语'},
        {code: 'el', name: '希腊语'},
        {code: 'nl', name: '荷兰语'},
        {code: 'pl', name: '波兰语'},
        {code: 'bul', name: '保加利亚语'},
        {code: 'est', name: '爱沙尼亚语'},
        {code: 'dan', name: '丹麦语'},
        {code: 'fin', name: '芬兰语'},
        {code: 'cs', name: '捷克语'},
        {code: 'rom', name: '罗马尼亚语'},
        {code: 'slo', name: '斯洛文尼亚语'},
        {code: 'swe', name: '瑞典语'},
        {code: 'hu', name: '匈牙利语'},
        {code: 'cht', name: '繁体中文'},
        {code: 'vie', name: '越南语'}
      ],
      resultText: '',
      originalText: '',
      disabledSubmitBtn: false,
      voice: null,
      disabledVoiceBtn: false,
      available: false
    }
  },
  methods: {
    // 提交翻译
    submit() {
      // 如果没有填写 API 密钥就弹出提示
      if (!this.available) {
        window.electronAPI.ipcRenderer.invoke('dialog', {
          name: 'showMessageBox',
          options: {
            title: '没有填写 API 密钥',
            message: '您还没有填写百度翻译的 API 密钥信息，目前翻译功能暂不可用，请在设置中填写百度翻译的 API 密钥信息！',
            buttons: ['知道了'],
            type: 'info',
            noLink: true
          }
        });
        return false;
      }
      // 翻译内容是否为空
      if (this.originalText === '') {
        window.electronAPI.ipcRenderer.invoke('dialog', {
          name: 'showMessageBox',
          options: {
            title: '翻译内容为空！',
            message: '翻译内容不能为空，请输入要翻译的内容！',
            buttons: ['关闭'],
            type: 'error',
            noLink: true
          }
        });
        return false;
      }
      // 原文语言和译文语言是否相同
      if (this.languageSelected1 === this.languageSelected2) {
        window.electronAPI.ipcRenderer.invoke('dialog', {
          name: 'showMessageBox',
          options: {
            title: '原文语言和译文语言相同',
            message: '原文语言和译文语言不能选择同一种语言！',
            buttons: ['关闭'],
            type: 'error',
            noLink: true
          }
        });
        return false;
      }
      // 需要提交翻译的内容
      const submitData = {
        q: this.originalText,
        from: this.languageSelected1,
        to: this.languageSelected2,
        options: this.$store.state.options
      };
      // 禁用翻译按钮
      this.disabledSubmitBtn = true;
      // 提交翻译请求
      window.electronAPI.ipcRenderer.invoke('translation', submitData).then(result => {
        this.disabledSubmitBtn = false;
        if (result.code !== undefined && result.msg !== undefined) {
          window.electronAPI.ipcRenderer.invoke('dialog', {
            name: 'showMessageBox',
            options: {
              title: '错误：' + result.code,
              message: result.msg,
              buttons: ['关闭'],
              type: 'error',
              noLink: true
            }
          });
          return false;
        }
        this.resultText = result.join("\n");
        // 如果开启了翻译完成后自动朗读就朗读译文
        if (this.$store.state.options.translationAutoVoice) {
          this.startVoice(this.resultText);
        }
      })
    },
    // 清空
    clear() {
      this.resultText = '';
      this.originalText = '';
      this.voice.stop();
    },
    // 开始语音朗读
    startVoice(text) {
      if (text === '') return false;
      this.voice.start({
        text: text,
        start: () => {
          // 开始朗读后禁用朗读按钮
          this.disabledVoiceBtn = true;
        },
        stop: () => {
          // 停止朗读后恢复朗读按钮
          this.disabledVoiceBtn = false;
        }
      });
    },
    // 拷贝译文
    copyText() {
      if (this.resultText === '') return false;
      // 发送拷贝请求
      window.electronAPI.ipcRenderer.invoke('copy-text', this.resultText);
    },
    // 检查 API 密钥是否填写
    apiInit() {
      if (
          this.$store.state.options.baiduTranslationAppID !== '' &&
          this.$store.state.options.baiduTranslationApiKey !== ''
      ) {
        this.available = true;
      }
      // 如果没有填写 API 密钥就弹出提示
      if (!this.available) {
        window.electronAPI.ipcRenderer.invoke('dialog', {
          name: 'showMessageBox',
          options: {
            title: '没有填写 API 密钥',
            message: '您还没有填写百度翻译的 API 密钥信息，目前翻译功能暂不可用，请在设置中填写百度翻译的 API 密钥信息！',
            buttons: ['知道了'],
            type: 'info',
            noLink: true
          }
        });
      }
    },
    // 自动翻译
    autoTranslation() {
      if (
          this.$route.query.ocrTranslation !== undefined &&
          this.$store.state.translation !== null &&
          Number(this.$route.query.ocrTranslation) === this.$store.state.translation.length
      ) {
        // 把 Vuex 中的需要翻译的内容添加到原文输入框
        this.originalText = this.$store.state.translation;
        // 清空 Vuex 中存储的需要翻译的内容
        this.$store.commit('changeTranslation', null);
        // 如果开启了自动翻译就提交翻译
        if (this.$store.state.options.autoTranslation) {
          this.submit();
        }
      }
    },
    // 上下文菜单
    contextMenu(ev) {
      ev.preventDefault();
      const client = {
        x: ev.clientX,
        y: ev.clientY
      };
      window.electronAPI.ipcRenderer.send('contextMenu', client);
    }
  },
  created() {
    document.title = '翻译';
    // 初始化语音朗读
    this.voice = new Voice();
    // 检查 API 密钥
    this.apiInit();
    // 检查自动翻译
    this.autoTranslation();
  }
}
</script>

<style scoped>
#translation-page {
  height: 100%;
  flex-direction: column;
  display: flex;
}
/*顶部工具栏区域*/
#translation-page .toolbar {
  display: flex;
  justify-content: space-between;
  border-bottom: 1px solid #EEEEEE;
  -webkit-user-select: none;
  user-select: none;
}
/*工具栏的按钮*/
#translation-page .toolbar button {
  transition: 0.3s;
}
#translation-page .toolbar button:focus {
  box-shadow: none;
  color: #409EFF;
}
#translation-page .toolbar button:hover {
  color: #409EFF;
}
/*语言选择区域*/
#translation-page .toolbar .language-box {
  width: 360px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/*输入和译文显示区域*/
#translation-page .text-box {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  flex: 1;
  overflow: hidden;
}
#translation-page .original-box,#translation-page .result-box {
  width: 50%;
  height: 100%;
  display: block;
}
#translation-page .text-box textarea {
  width: 100%;
  height: 100%;
  resize: none;
}
#translation-page .text-box textarea:focus {
  box-shadow: none;
}
</style>