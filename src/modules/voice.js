export default class Voice {
  synth = null;  // 合成器
  volume = 1;  // 音量
  speed = 1;  // 语速
  voiceLibrary = null;  // 语音库
  voiceLibraryName = '';  // 语音库名称
  utterThis = null;

  // 初始化
  constructor(config = {}) {
    // 设置音量
    if (config.volume !== undefined) this.volume = config.volume;
    // 设置语速
    if (config.speed !== undefined) this.speed = config.speed;
    // 设置语音库名称
    if (config.voiceLibrary !== undefined) this.voiceLibraryName = config.voiceLibrary;
    // 初始化语音合成对象
    this.synth = window.speechSynthesis;
    // 延迟获取语音库
    let voiceLibraryList = null;
    setTimeout(() => {
      voiceLibraryList = this.synth.getVoices();
      if (this.voiceLibraryName !== '') {
        // 找出设置的语音库
        for (let i = 0;i < voiceLibraryList.length;i ++) {
          if (voiceLibraryList[i].name === this.voiceLibraryName) {
            this.voiceLibrary = voiceLibraryList[i];
            break;
          }
        }
      }else {
        // 找出中文语音库
        for (let i = 0;i < voiceLibraryList.length;i ++) {
          if (voiceLibraryList[i].lang === 'zh-CN' || voiceLibraryList[i].lang === 'zh-TW') {
            this.voiceLibrary = voiceLibraryList[i];
            break;
          }
        }
      }
    }, 200);
    this.utterThis = new SpeechSynthesisUtterance();
  }

  // 寻找指定语言的语音库
  changeLanguage(language) {
    let exist = false;  // 如果找到指定语言的语音库就为 true
    const re = new RegExp(language, 'i');  // 匹配语音库的正则表达式
    const voiceLibraryList = this.synth.getVoices();  // 获取语音库列表
    for (let i = 0;i < voiceLibraryList.length;i ++) {
      if (re.test(voiceLibraryList[i].lang)) {
        this.voiceLibrary = voiceLibraryList[i];
        this.voiceLibraryName = voiceLibraryList[i].name;
        exist = true;
        break;
      }
    }
    return exist;
  }

  // 开始朗读
  start(options) {
    // 设置合成的文本内容
    this.utterThis.text = options.text;
    // 设置语音库
    this.utterThis.voice = this.voiceLibrary;
    // 设置音量
    this.utterThis.volume = this.volume;
    // 设置语速
    this.utterThis.rate = this.speed;
    // 设置音调为中等
    this.utterThis.pitch = 1;
    // 开始朗读
    this.synth.speak(this.utterThis);
    // 朗读已开始
    this.utterThis.onstart = () => {
      if (typeof options.start === "function") {
        options.start();
      }
    }
    // 朗读已停止
    this.utterThis.onend = () => {
      if (typeof options.stop === "function") {
        options.stop();
      }
    }
  }

  // 停止朗读
  stop() {
    this.synth.cancel();
  }
}