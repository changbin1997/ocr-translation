<template>
  <div id="translation-history-table">
    <h2 class="text-center py-3">共包含 {{count}} 条记录</h2>
    <table class="table table-bordered table-striped table-hover">
      <thead>
      <tr>
        <th>提供商</th>
        <th>字数</th>
        <th>时间</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, index) of translationList" :key="index">
        <td>{{item.provider}}</td>
        <td>{{item.word_count}}</td>
        <td>{{item.translation_time}}</td>
      </tr>
      </tbody>
    </table>
    <nav class="page-nav-box text-center py-2" v-if="count">
      <div class="btn-group btn-group-sm">
        <button type="button" class="btn btn-outline-primary" :disabled="pageNum === 1" @click="previousPage">上一页</button>
        <button type="button" class="btn btn-outline-primary">{{pageNum}}/{{pageCount}}</button>
        <button type="button" class="btn btn-outline-primary" :disabled="pageNum >= pageCount" @click="nextPage">下一页</button>
      </div>
    </nav>
  </div>
</template>

<script>
export default {
  name: 'translation-history-table',
  data() {
    return {
      count: 0,
      translationList: [],
      pageCount: 0,
      pageNum: 1
    }
  },
  methods: {
    // 获取翻译历史记录
    getTranslationHistoryList() {
      // 要提交的数据
      const submitData = {
        start: this.pageNum * 20 - 20,
        count: 20
      };
      // 发送请求
      window.electronAPI.ipcRenderer.invoke('translationHistoryList', submitData).then(result => {
        this.count = result.count;
        this.translationList = result.list;
        // 计算总页数
        this.pageCount = Math.ceil(this.count / 20);
      });
    },
    // 下一页
    nextPage() {
      this.pageNum ++;
      this.getTranslationHistoryList()
    },
    // 上一页
    previousPage() {
      this.pageNum --;
      this.getTranslationHistoryList()
    }
  },
  created() {
    this.getTranslationHistoryList();
  }
}
</script>

<style scoped>

</style>