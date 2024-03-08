<template>
  <div id="ocr-history-table">
    <h2 class="text-center py-3">共包含 {{count}} 条记录</h2>
    <table class="table table-bordered table-striped table-hover">
      <thead>
        <tr>
          <th>OCR产品名称</th>
          <th>提供商</th>
          <th>时间</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(item, index) of ocrList" :key="index">
          <td>{{item.name}}</td>
          <td>{{provider[item.provider]}}</td>
          <td>{{item.ocr_time}}</td>
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
  name: 'ocr-history-table',
  data() {
    return {
      count: 0,
      ocrList: [],
      pageCount: 0,
      pageNum: 1,
      provider: {baidu: '百度', tencent: '腾讯', xunfei: '科大讯飞'}
    }
  },
  methods: {
    // 获取 OCR 历史记录
    getOcrHistoryList() {
      // 要提交的数据
      const submitData = {
        start: this.pageNum * 20 - 20,
        count: 20
      };
      // 发送请求
      window.electronAPI.ipcRenderer.invoke('ocrHistoryList', submitData).then(result => {
        this.count = result.count;
        this.ocrList = result.list;
        // 计算总页数
        this.pageCount = Math.ceil(this.count / 20);
      });
    },
    // 下一页
    nextPage() {
      this.pageNum ++;
      this.getOcrHistoryList();
    },
    // 上一页
    previousPage() {
      this.pageNum --;
      this.getOcrHistoryList();
    }
  },
  created() {
    this.getOcrHistoryList();
  }
}
</script>