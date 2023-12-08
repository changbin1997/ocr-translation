const {Menu} = require('electron');
const ExportResult = require('./ExportResult');

module.exports = class ContextMenu {
  // 导出 OCR 识别结果菜单
  static exportOcrMenu(x, y, result) {
    // 菜单模板
    const menuTemplate = [
      {
        label: '导出为 TXT（不带图片）',
        click() {
         const exportResult = new ExportResult();
         exportResult.ocrResultTxt(result); 
        }
      },
      {
        label: '导出为 HTML（带图片）',
        click() {
          const exportResult = new ExportResult();
          exportResult.ocrResultHTML(result);
        }
      }
    ];
    // 构建菜单项
    const menu = Menu.buildFromTemplate(menuTemplate);
    // 弹出菜单
    menu.popup({
      x: x,
      y: y
    });
  }

  // 导出翻译结果菜单
  static exportTranslationMenu(x, y, result) {
    // 菜单模板
    const menuTemplate = [
      {
        label: '导出为 TXT',
        click() {
          const exportResult = new ExportResult();
          exportResult.translationResultTxt(result);
        }
      },
      {
        label: '导出为 HTML',
        click() {
          const exportResult = new ExportResult();
          exportResult.translationResultHTML(result);
        }
      }
    ];
    // 构建菜单项
    const menu = Menu.buildFromTemplate(menuTemplate);
    // 弹出菜单
    menu.popup({
      x: x,
      y: y
    });
  }

  // 用于表单的上下文菜单
  static inputMenu(x, y) {
    // 菜单模板
    const menuTemplate = [
      {
        label: '全选',
        role: 'selectAll'
      },
      {
        label: '剪切',
        role: 'cut'
      },
      {
        label: '复制',
        role: 'copy'
      },
      {
        label: '粘贴',
        role: 'paste'
      }
    ];

    // 构建菜单
    const menu = Menu.buildFromTemplate(menuTemplate);
    // 弹出菜单
    menu.popup({
      x: x,
      y: y
    });
  }
};