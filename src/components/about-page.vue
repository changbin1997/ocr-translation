<template>
  <div id="about-page">
    <div class="p-3">
      <h2>关于本软件</h2>
      <p>这只是我为了个人需求写的一个我自用的软件，软件没有内置 API 密钥信息，需要自己申请 API 填写使用，下面是目前支持的 API 功能：</p>
      <ul>
        <li>百度通用文字识别 - 通用文字识别（标准版）</li>
        <li>百度通用文字识别 - 通用文字识别（高精度版）</li>
        <li>腾讯通用文字识别 - 通用印刷体识别（标准版）</li>
        <li>腾讯通用文字识别 - 通用印刷体识别（高精度版）</li>
        <li>腾讯通用文字识别 - 广告文字识别</li>
        <li>腾讯通用文字识别 - 手写体识别</li>
        <li>百度翻译</li>
      </ul>
      <p>上面是目前支持调用的 API 服务，如果后续找到还可以的提供免费额度的 API 服务，我也会加进去。</p>
      <p>本软件由 changbin1997 开发，使用 MIT License 开源。</p>
      <p>Github：<a href="https://github.com/changbin1997/ocr-desktop" @click="openLink">https://github.com/changbin1997/ocr-desktop</a></p>
      <p>开发者 Github：<a href="https://github.com/changbin1997" @click="openLink">https://github.com/changbin1997</a></p>
      <p>开发者博客：<a href="https://www.misterma.com" @click="openLink">https://www.misterma.com/</a></p>
      <p>开发者邮箱地址：email@misterma.com</p>
      <h2> OCR API 申请地址 </h2>
      <p>百度 OCR：<a href="https://ai.baidu.com/tech/ocr" @click="openLink">https://ai.baidu.com/tech/ocr</a></p>
      <p>腾讯 OCR：<a href="https://cloud.tencent.com/product/ocr-catalog" @click="openLink">https://cloud.tencent.com/product/ocr-catalog</a></p>
      <p>百度翻译：<a href="https://fanyi-api.baidu.com/" @click="openLink">https://fanyi-api.baidu.com/</a></p>
      <p>下面是 API 的免费额度说明：</p>
      <ul>
        <li>百度通用文字识别：每月 1000 次免费</li>
        <li>腾讯通用文字识别：每月 1000 次免费</li>
        <li>百度翻译 API：标准版每月 50000 字免费</li>
      </ul>
      <p>以上信息写于 2022 年 8 月 28 日，API 额度可能随时会更改，一切以官网为准。</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'about-page',
  methods: {
    // 通过浏览器打开链接
    openLink(ev) {
      ev.preventDefault();
      const url = ev.target.href;
      window.electronAPI.ipcRenderer.send('openLink', url);
    }
  },
  created() {
    document.title = '关于';
  }
}
</script>

<style scoped>
#about-page {
  height: 100%;
  overflow-y: auto;
}
#about-page h2 {
  font-size: 22px;
}
</style>