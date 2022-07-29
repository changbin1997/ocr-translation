const {Menu} = require('electron');

module.exports = (x, y) => {
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
};