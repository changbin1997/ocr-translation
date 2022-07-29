module.exports = class Datetime {
  // 获取本月第一天的时间戳
  static monthFirstDayTimestamp() {
    return Math.round(new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      1
    ).getTime() / 1000);
  }

  // 时间戳格式化
  static timestampFormat(timestamp) {
    const date = new Date(timestamp * 1000);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    let minute = date.getMinutes();
    if (minute < 10) minute = '0' + minute;
    return (`${year}年${month}月${day}日 ${hour}:${minute}`);
  }
}