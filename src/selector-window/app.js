const img = document.querySelector('#img');
const overlayEl = document.querySelector('#overlay');  // 图片遮罩层
const selectBoxEl = document.querySelector('#select-box');  // 图片选择框

window.electronAPI.onResponse('img', (ev, result) => {
  // 在 img 中显示图片
  const blob = new Blob([result], {type: 'image/png'});
  const imgUrl = URL.createObjectURL(blob);
  img.src = imgUrl;
});

let mouseActive = false;
const selectBoxPosition = {x: 0, y: 0};
// 图像显示区域鼠标按下
overlayEl.addEventListener('mousedown', ev => {
  // 显示图片区域选择框
  selectBoxEl.style.display = 'block';
  selectBoxEl.style.left = ev.clientX + 'px';
  selectBoxEl.style.top = ev.clientY + 'px';
  selectBoxEl.style.width = 0;
  selectBoxEl.style.height = 0;
  selectBoxEl.style.backgroundImage = `url(${img.src})`;
  selectBoxEl.style.backgroundPosition = `-${ev.clientX}px -${ev.clientY}px`;
  selectBoxPosition.x = ev.clientX;
  selectBoxPosition.y = ev.clientY;
  mouseActive = true;
});

// 图像显示区域鼠标移动
document.addEventListener('mousemove', ev => {
  if (mouseActive) {
    selectBoxEl.style.width = ev.clientX - selectBoxPosition.x + 'px';
    selectBoxEl.style.height = ev.clientY - selectBoxPosition.y + 'px';
  }
});

// 图像显示区域鼠标放开
document.addEventListener('mouseup', () => {
  mouseActive = false;
  const position = {
    left: selectBoxEl.offsetLeft,
    top: selectBoxEl.offsetTop,
    width: selectBoxEl.offsetWidth,
    height: selectBoxEl.offsetHeight,
    result: 'success'
  };
  window.electronAPI.ipcRenderer.invoke('complete', position);
});