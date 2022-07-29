<template>
  <div id="app">
    <sidebar />
    <div id="page">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import sidebar from '@/components/sidebar';

export default {
  name: 'App',
  components: {
    sidebar
  },
  methods: {
    // 获取选项
    getOptions() {
      window.electronAPI.ipcRenderer.invoke('getOptions').then(options => {
        if (options === null) return false;
        this.$store.commit('changeOptions', options);
      })
    }
  },
  created() {
    this.getOptions();
  },
  mounted() {
    // 接收快捷键调用的 OCR 结果
    window.electronAPI.onResponse('ocrResult', (ev, args) => {
      if (args.img !== undefined && args.text !== undefined) {
        this.$store.commit('changeOcrResult', args);
        this.$router.push({
          name: 'ocrPage',
          query: {
            ocrResult: 'xxx',
            time: String(Date.parse(new Date()))
          }
        });
      }
    });
  }
}
</script>

<style>
html {
  height: 100%;
}
body {
  height: 100%;
}
#app {
  height: 100%;
  display: flex;
  justify-content: flex-start;
}
#page {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  height: 100%;
}
</style>
