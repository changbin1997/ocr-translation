const sqlite3 = require('sqlite3');
const path = require('path');
const Datetime = require('./Datetime');

module.exports = class Data {
  db = null;
  dbErr = null;

  constructor() {
    const dbName = path.join(process.cwd(), 'data.db');  // 数据库名
    // 打开数据库
    this.db = new sqlite3.Database(dbName, err => {
      if (err !== null) {
        this.dbErr = err;
      }
    });
  }

  // 保存选项
  updateOptions(options) {
    return new Promise(resolve => {
      // 获取选项名
      const optionsName = Object.keys(options);
      let value = '';  // 用来存储选项值
      let count = 0;  // 用来存储更改的行数

      for (let i = 0;i < optionsName.length;i ++) {
        // 把 Number 类型的值转为 String
        if (typeof options[optionsName[i]] === "number") {
          value = String(options[optionsName[i]]);
        }
        // 把 Boolean 类型的值转为 String
        if (typeof options[optionsName[i]] === "boolean") {
          value = String(Number(options[optionsName[i]]));
        }
        // String 类型的值就直接传给 value
        if (typeof options[optionsName[i]] === "string") {
          value = options[optionsName[i]];
        }
        // 更新数据
        const sql = 'UPDATE ocr_options SET value = $value WHERE name = $name';
        const values = {$name: optionsName[i], $value: value};
        this.db.run(sql, values, function(err) {
          if (err) resolve(count);
          count += this.changes;
          if (count === optionsName.length) resolve(count);
        });
      }
    });
  }

  // 获取选项
  getOptions() {
    return new Promise((resolve) => {
      this.db.all('SELECT name, value FROM ocr_options', (err, rows) => {
        if (err) {
          this.dbErr = err;
          resolve(null);
          return false;
        }
        if (rows.length < 20) resolve(null);
        const options = {};  // 用来存储转换后的选项
        rows.forEach(item => {
          // 把选项名和选项值传给 options
          options[item.name] = item.value;
        });
        // 把 Boolean 类型的选项值转为 Boolean
        options.keyF1Enable = Boolean(Number(options.keyF1Enable));
        options.keyF2Enable = Boolean(Number(options.keyF2Enable));
        options.ocrAutoVoice = Boolean(Number(options.ocrAutoVoice));
        options.translationAutoVoice = Boolean(Number(options.translationAutoVoice));
        options.autoTranslation = Boolean(Number(options.autoTranslation));
        // 把 Number 类型的值转为 Number
        options.ocrVoiceSpeed = Number(options.ocrVoiceSpeed);
        options.ocrVoiceVolume = Number(options.ocrVoiceVolume);
        resolve(options);
      });
    });
  }

  // 初始化
  init() {
    let successCount = 0;  // 记录完成次数

    return new Promise((resolve, reject) => {
      // 检查选项数据表是否存在
      this.optionsTableExists().then(result => {
        // 如果选项数据表不存在就创建数据表
        if (result < 1) {
          // 创建数据表
          this.createOptionsTable().then(count => {
            if (count < 1) {
              reject({errno: 'Database Error', code: '无法创建选项数据表！'});
              return false;
            }
            // 写入默认选项
            this.insertOptions().then(count => {
              if (count < 20) {
                reject({errno: 'Database Error', code: '无法创建选项数据表！'});
                return false;
              }
              successCount ++;
              if (successCount === 3) resolve(successCount);
            })
          });
        }else {
          successCount ++;
          if (successCount === 3) resolve(successCount);
        }
      }).catch(error => {
        reject(error);
      });

      // 检查 OCR 历史记录数据表是否存在
      this.ocrHistoryTableExists().then(result => {
        // 如果数据表不存在就创建
        if (result < 1) {
          this.createOcrHistoryTable().then(count => {
            // 如果创建失败
            if (count < 1) {
              reject({errno: 'Database Error', code: '无法创建 OCR 历史记录数据表！'});
              return false;
            }
            successCount ++;
            if (successCount === 3) resolve(successCount);
          });
        }else {
          successCount ++;
          if (successCount === 3) resolve(successCount);
        }
      }).catch(error => {
        reject(error);
      });
      // 检查翻译历史记录数据表是否存在
      this.translationHistoryTableExists().then(result => {
        if (result < 1) {
          // 如果不存在就创建数据表
          this.createTranslationHistoryTable().then(count => {
            // 如果创建失败
            if (count < 1) {
              reject({errno: 'Database Error', code: '无法创建翻译历史记录数据表！'});
              return false;
            }
            successCount ++;
            if (successCount === 3) resolve(successCount);
          });
        }else {
          successCount ++;
          if (successCount === 3) resolve(successCount);
        }
      }).catch(error => {
        reject(error);
      });
    });
  }

  // 写入默认选项
  insertOptions() {
    // 默认选项
    const options = {
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
    };

    // 获取选项的名称
    const optionsName = Object.keys(options);
    let values = [];  // 用来存储要写入的 SQL VALUES
    let sqlPlaceholder = [];  // 用来存储 SQL 占位符

    optionsName.forEach(item => {
      let value = '';
      // 把 Number 类型的值转为 String
      if (typeof options[item] === "number") {
        value = String(options[item]);
      }
      // 把 Boolean 类型的值转为 String
      if (typeof options[item] === "boolean") {
        value = String(Number(options[item]));
      }
      // 如果是 String 类型的就直接加入 value
      if (typeof options[item] === "string") {
        value = options[item];
      }
      // 把选项名和选项值加入 values
      values.push(item);
      values.push(value);
      // 把 SQL 占位符加入 sqlPlaceholder
      sqlPlaceholder.push('(?, ?)');
    });

    const sql = `
    INSERT INTO ocr_options
    (name, value)
    VALUES
    ${sqlPlaceholder.join(',')}
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
          return false;
        }
        resolve(this.changes);
      });
    });
  }

  // 创建选项数据表
  createOptionsTable() {
    const sql = `
    CREATE TABLE ocr_options (
    name VARCHAR (250) NOT NULL,
    value VARCHAR (300) NOT NULL DEFAULT ""
    )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, err => {
        if (err) {
          reject(err);
          return false;
        }
        // 查询是否创建成功
        this.optionsTableExists().then(result => {
          resolve(result);
        })
      });
    });
  }

  // 添加 OCR 历史记录
  addOcrHistory(provider, ocrType) {
    // 获取时间戳
    const time = Math.round(new Date().getTime() / 1000);
    // 添加数据
    const sql = `
    INSERT INTO ocr_history
    (name, provider, ocr_time)
    VALUES
    (?, ?, ?)
    `;
    return new Promise((resolve) => {
      this.db.run(sql, [ocrType, provider, time], function(err) {
        if (err) {
          resolve(err);
          return false;
        }
        resolve(this.changes);
      });
    });
  }

  // 创建 OCR 历史记录数据表
  createOcrHistoryTable() {
    const sql = `
    CREATE TABLE ocr_history (
    id INTEGER PRIMARY KEY,
    name VARCHAR (50) NOT NULL,
    provider VARCHAR (50) NOT NULL,
    ocr_time INTEGER NOT NULL DEFAULT 0
    )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, err => {
        if (err) {
          reject(err);
          return false;
        }
        this.ocrHistoryTableExists().then(result => {
          resolve(result);
        });
      });
    });
  }

  // 获取 OCR 历史记录
  getOcrHistoryList(start = 0, count = 20) {
    const ocrData = {};  // 用来存储查询出的 OCR 记录

    return new Promise(resolve => {
      // 获取 OCR 记录的数量
      this.db.get('SELECT COUNT(*) FROM ocr_history', (err, row) => {
        ocrData.count = row['COUNT(*)'];
        // 所有数据查询完成就返回
        if (ocrData.count !== undefined && ocrData.list !== undefined) {
          resolve(ocrData);
        }
      });

      // 从 start 位置查询出 count 条 OCR 记录
      const sql = `
      SELECT id, name, provider, ocr_time
      FROM ocr_history
      ORDER BY ocr_time DESC
      LIMIT ?, ?
      `;

      this.db.all(sql, [start, count], (err, rows) => {
        // 时间戳格式化
        for (let i = 0;i < rows.length;i ++) {
          rows[i].ocr_time = Datetime.timestampFormat(rows[i].ocr_time);
        }
        ocrData.list = rows;
        // 所有数据查询完成就返回
        if (ocrData.count !== undefined && ocrData.list !== undefined) {
          resolve(ocrData);
        }
      });
    });
  }

  // 清空腾讯 OCR 记录
  deleteTencentOcrHistory() {
    return new Promise(resolve => {
      const sql = 'DELETE FROM ocr_history WHERE provider = ?';
      this.db.run(sql, ['tencent'], function() {
        resolve(this.changes);
      });
    });
  }

  // 获取腾讯 OCR 记录总览
  getTencentOcrHistoryOverview() {
    const dataList = [];  // 用来存储查询出的数据
    const monthFirstDay = Datetime.monthFirstDayTimestamp();
    // 要执行的 SQL
    const sqlList = [
      {
        name: '腾讯 OCR 总使用量',
        sql: `SELECT COUNT(*) FROM ocr_history WHERE provider = ?`,
        values: ['tencent']
      },
      {
        name: '本月腾讯 OCR 使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE provider = ? AND ocr_time > ?
        `,
        values: ['tencent', monthFirstDay]
      },
      {
        name: '本月腾讯云通用印刷体识别使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['腾讯云通用印刷体识别', monthFirstDay]
      },
      {
        name: '本月腾讯云通用印刷体识别（高精度版）使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['腾讯云通用印刷体识别（高精度版）', monthFirstDay]
      },
      {
        name: '本月腾讯云通用手写体识别使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['腾讯云通用手写体识别', monthFirstDay]
      },
      {
        name: '本月腾讯云广告文字识别使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['腾讯云广告文字识别', monthFirstDay]
      }
    ];

    return new Promise(resolve => {
      // 执行 SQL
      sqlList.forEach(item => {
        this.db.get(item.sql, item.values, (err, row) => {
          dataList.push({
            name: item.name,
            count: row['COUNT(*)']
          });
          if (dataList.length >= sqlList.length) resolve(dataList);
        });
      });
    });
  }

  // 清空百度 OCR 记录
  deleteAllBaiduOcrHistory() {
    return new Promise(resolve => {
      const sql = 'DELETE FROM ocr_history WHERE provider = ?';
      this.db.run(sql, ['baidu'], function() {
        resolve(this.changes);
      });
    });
  }

  // 获取百度 OCR 记录总览
  getBaiduOcrHistoryOverview() {
    const dataList = [];  // 用来存储查询出的数据
    const monthFirstDay = Datetime.monthFirstDayTimestamp();
    // 要执行的 SQL
    const sqlList = [
      {
        name: '百度 OCR 总使用量',
        sql: `SELECT COUNT(*) FROM ocr_history WHERE provider = ?`,
        values: ['baidu']
      },
      {
        name: '本月百度 OCR 使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE provider = ? AND ocr_time > ?
        `,
        values: ['baidu', monthFirstDay]
      },
      {
        name: '本月百度通用OCR识别使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['百度通用OCR识别', monthFirstDay]
      },
      {
        name: '本月百度高精度OCR识别使用量',
        sql: `
        SELECT COUNT(*) FROM ocr_history
        WHERE name = ? AND ocr_time > ?
        `,
        values: ['百度高精度OCR识别', monthFirstDay]
      }
    ];

    return new Promise(resolve => {
      // 执行 SQL
      sqlList.forEach(item => {
        this.db.get(item.sql, item.values, (err, row) => {
          dataList.push({
            name: item.name,
            count: row['COUNT(*)']
          });
          if (dataList.length >= sqlList.length) resolve(dataList);
        });
      });
    });
  }

  // 添加翻译历史记录
  addTranslationHistory(provider, wordCount) {
    // 获取时间戳
    const time = Math.round(new Date().getTime() / 1000);
    // 添加数据
    const sql = `
    INSERT INTO translation_history
    (provider, translation_time, word_count)
    VALUES
    (?, ?, ?)
    `;
    return new Promise(resolve => {
      this.db.run(sql, [provider, time, wordCount], function(err) {
        if (err) {
          resolve(err);
          return false;
        }
        resolve(this.changes);
      });
    });
  }

  // 创建翻译历史记录数据表
  createTranslationHistoryTable() {
    const sql = `
    CREATE TABLE translation_history (
    id INTEGER PRIMARY KEY,
    provider VARCHAR (50) NOT NULL,
    translation_time INTEGER NOT NULL DEFAULT 0,
    word_count INTEGER NOT NULL
    )
    `;
    return new Promise((resolve, reject) => {
      this.db.run(sql, err => {
        if (err) {
          reject(err);
          return false;
        }
        this.translationHistoryTableExists().then(result => {
          resolve(result);
        });
      });
    });
  }

  // 清空翻译历史记录
  deleteAllTranslationHistory() {
    return new Promise(resolve => {
      this.db.run('DELETE FROM translation_history', function() {
        resolve(this.changes);
      });
    });
  }

  // 获取翻译历史记录
  getTranslationHistoryList(start = 0, count = 20) {
    const dataList = {};

    return new Promise(resolve => {
      // 查询出总量
      this.db.get('SELECT COUNT(*) FROM translation_history', (err, row) => {
        dataList.count = row['COUNT(*)'];
        // 全部查询完毕就返回
        if (dataList.count !== undefined && dataList.list !== undefined) {
          resolve(dataList);
        }
      });

      // 从 start 开始，查询出 count 条翻译记录
      const sql = `
      SELECT id, provider, translation_time, word_count
      FROM translation_history
      ORDER BY translation_time DESC
      LIMIT ?, ?
      `;
      this.db.all(sql, [start, count], (err, rows) => {
        // 时间格式化
        for (let i = 0;i < rows.length;i ++) {
          rows[i].translation_time = Datetime.timestampFormat(rows[i].translation_time);
        }
        dataList.list = rows;
        // 全部查询完毕就返回
        if (dataList.count !== undefined && dataList.list !== undefined) {
          resolve(dataList);
        }
      });
    });
  }

  // 获取翻译历史记录总览数据
  getTranslationHistoryOverview() {
    const dataList = [];
    return new Promise(resolve => {
      // 查询出翻译总字数
      this.db.get('SELECT SUM(word_count) AS count FROM translation_history', (err, row) => {
        dataList.push({
          name: '百度翻译总字数',
          count: row.count === null?0:row.count
        });
        // 如果全部查询完毕就返回数据
        if (dataList.length === 2) resolve(dataList);
      });

      // 查询出本月的翻译字数
      const sql = `
      SELECT SUM(word_count) AS count
      FROM translation_history
      WHERE translation_time > ?
      `;
      this.db.get(sql, [Datetime.monthFirstDayTimestamp()], (err, row) => {
        dataList.push({
          name: '本月百度翻译字数',
          count: row.count === null?0:row.count
        });
        // 如果全部查询完毕就返回数据
        if (dataList.length === 2) resolve(dataList);
      });
    });
  }

  // OCR 历史记录的数据表是否存在
  ocrHistoryTableExists() {
    // 查询出 OCR 历史表格的数量
    const sql = `
    SELECT COUNT(*) FROM sqlite_master
    WHERE type="table" AND name="ocr_history"
    `;
    return new Promise((resolve, reject) => {
      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(row['COUNT(*)']);
      });
    });
  }

  // 翻译历史记录的数据表是否存在
  translationHistoryTableExists() {
    // 查询出翻译记录表格的数量
    const sql = `
    SELECT COUNT(*) FROM sqlite_master
    WHERE type="table" AND name="translation_history"
    `;
    return new Promise((resolve, reject) => {
      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(row['COUNT(*)']);
      });
    });
  }

  // 存储选项的数据表是否存在
  optionsTableExists() {
    // 查询出选项表格的数量
    const sql = `
    SELECT COUNT(*) FROM sqlite_master
    WHERE type="table" AND name="ocr_options"
    `;
    return new Promise((resolve, reject) => {
      this.db.get(sql, (err, row) => {
        if (err) {
          reject(err);
          return false;
        }
        resolve(row['COUNT(*)']);
      });
    });
  }
};