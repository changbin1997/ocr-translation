<template>
  <div id="history-overview">
    <h2 class="mb-3">百度 OCR 记录</h2>
    <div class="row">
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-for="(item, index) of baidu" :key="index">
        <div class="data-box">
          <h3 class="text-center">{{item.count}}</h3>
          <p class="text-center mb-2">{{item.name}}</p>
        </div>
      </div>
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-if="baidu.length">
        <div class="data-box" tabindex="0" role="button" @click="deleteAllBaiduOcrHistory">
          <h3 class="text-center">删除</h3>
          <p class="text-center mb-2">删除百度OCR数据</p>
        </div>
      </div>
    </div>
    <hr>
    <h2 class="mb-3">腾讯 OCR 记录</h2>
    <div class="row">
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-for="(item, index) of tencent" :key="index">
        <div class="data-box">
          <h3 class="text-center">{{item.count}}</h3>
          <p class="text-center mb-2">{{item.name}}</p>
        </div>
      </div>
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-if="baidu.length">
        <div class="data-box" tabindex="0" role="button" @click="deleteTencentOcrHistory">
          <h3 class="text-center">删除</h3>
          <p class="text-center mb-2">删除腾讯OCR数据</p>
        </div>
      </div>
    </div>
    <hr>
    <h2 class="mb-3">百度翻译记录</h2>
    <div class="row">
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-for="(item, index) of baiduTranslation" :key="index">
        <div class="data-box">
          <h3 class="text-center">{{item.count}}</h3>
          <p class="text-center mb-2">{{item.name}}</p>
        </div>
      </div>
      <div class="col-lg-3 col-xl-2 col-md-4 mb-3" v-if="baiduTranslation.length">
        <div class="data-box" @click="deleteAllTranslationHistory" tabindex="0" role="button">
          <h3 class="text-center">删除</h3>
          <p class="text-center mb-2">删除百度翻译数据</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'history-overview',
  data() {
    return {
      baidu: [],
      tencent: [],
      baiduTranslation: []
    }
  },
  methods: {
    // 获取 OCR 总览数据
    getOcrData() {
      window.electronAPI.ipcRenderer.invoke('ocrHistoryOverview').then(result => {
        this.baidu = result.baidu;
        this.tencent = result.tencent;
      });
    },
    // 获取翻译总览数据
    getTranslationData() {
      window.electronAPI.ipcRenderer.invoke('translationHistoryOverview').then(result => {
        this.baiduTranslation = result;
        console.log(result);
      });
    },
    // 清空翻译历史记录
    deleteAllTranslationHistory() {
      // 如果没有数据
      if (this.baiduTranslation[0].count < 1) return false;
      // 删除确认
      window.electronAPI.ipcRenderer.invoke('dialog', {
        name: 'showMessageBox',
        options: {
          title: '删除确认',
          message: '您确定要删除所有翻译历史记录吗，删除后无法恢复？',
          buttons: ['取消', '确定删除'],
          type: 'warning',
          noLink: true
        }
      }).then(result => {
        if (result.response === 1) {
          window.electronAPI.ipcRenderer.invoke('deleteAllTranslationHistory').then(count => {
            window.electronAPI.ipcRenderer.invoke('dialog', {
              name: 'showMessageBox',
              options: {
                title: '删除完成',
                message: `已删除 ${count} 条翻译记录`,
                buttons: ['关闭'],
                type: 'info',
                noLink: true
              }
            });
            // 重新加载翻译记录
            this.getTranslationData();
          });
        }
      });
    },
    // 清空百度 OCR 记录
    deleteAllBaiduOcrHistory() {
      // 检测是否有数据
      let notData = true;
      this.baidu.forEach(item => {
        if (item.count > 0) notData = false;
      });
      if (notData) return false;

      // 删除确认
      window.electronAPI.ipcRenderer.invoke('dialog', {
        name: 'showMessageBox',
        options: {
          title: '删除确认',
          message: '您确定要删除所有百度 OCR 历史记录吗，删除后无法恢复？',
          buttons: ['取消', '确定删除'],
          type: 'warning',
          noLink: true
        }
      }).then(result => {
        if (result.response === 1) {
          window.electronAPI.ipcRenderer.invoke('deleteAllBaiduOcrHistory').then(count => {
            window.electronAPI.ipcRenderer.invoke('dialog', {
              name: 'showMessageBox',
              options: {
                title: '删除完成',
                message: `已删除 ${count} 条百度 OCR 记录`,
                buttons: ['关闭'],
                type: 'info',
                noLink: true
              }
            });
            // 重新加载 OCR 记录
            this.getOcrData();
          });
        }
      });
    },
    // 清空腾讯 OCR 记录
    deleteTencentOcrHistory() {
      // 检测是否有数据
      let notData = true;
      this.tencent.forEach(item => {
        if (item.count > 0) notData = false;
      });
      if (notData) return false;

      // 删除确认
      window.electronAPI.ipcRenderer.invoke('dialog', {
        name: 'showMessageBox',
        options: {
          title: '删除确认',
          message: '您确定要删除所有腾讯 OCR 历史记录吗，删除后无法恢复？',
          buttons: ['取消', '确定删除'],
          type: 'warning',
          noLink: true
        }
      }).then(result => {
        if (result.response === 1) {
          window.electronAPI.ipcRenderer.invoke('deleteTencentOcrHistory').then(count => {
            window.electronAPI.ipcRenderer.invoke('dialog', {
              name: 'showMessageBox',
              options: {
                title: '删除完成',
                message: `已删除 ${count} 条腾讯 OCR 记录`,
                buttons: ['关闭'],
                type: 'info',
                noLink: true
              }
            });
            // 重新加载 OCR 记录
            this.getOcrData();
          });
        }
      });
    }
  },
  created() {
    this.getOcrData();
    this.getTranslationData();
  }
}
</script>

<style scoped>
/*卡片区域*/
#history-overview .data-box {
  background: #E7EAED;
  height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 8px;
}
#history-overview h2 {
  font-size: 22px;
}
</style>