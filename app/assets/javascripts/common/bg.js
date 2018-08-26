
/* global $ */

$(document).ready(function() {
  const canvas = document.getElementById("bg");
  if(canvas.parentNode === null) return;
  
  const rand = () => Math.random();
  const requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame;
  const cancelAnimationFrame = window.cancelAnimationFrame ||
                              window.mozCancelAnimationFrame;
  
  let width = document.documentElement.clientWidth;
  let height = document.documentElement.clientHeight;
  canvas.setAttribute("style", "position:fixed;z-index:-1;left:0;top:0;width:100vw;height:100vh;");
  canvas.width = width;
  canvas.height = height;
  
  const context = canvas.getContext("2d");
  const nodeCount = Math.floor((width + height) * 0.005 + 10);
  const nodes = [];
  for(let i = 0; i < nodeCount; i++) {
    const x = rand() * width;
    const y = rand() * height;
    const radius = 5 + i * i * 0.1;
    const angle = rand() * Math.PI * 2;
    
    const v = radius * 0.002;
    const lineWidth = radius * 0.2 + 1;
    const alpha = Math.min(radius / 150 + 0.01, 1);

    nodes.push({
      x: x,
      y: y,
      v: v,
      radius: radius,
      angle: angle,
      lineWidth: lineWidth,
      alpha: alpha,
    });
  }
  
  /* サイズを設定 */
  function setSize() {
    width = document.documentElement.clientWidth;
    height = document.documentElement.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }
  setSize();
  
  /* リサイズイベント */
  window.addEventListener("resize", function() {
    setSize();
  });
  
  /* スクロールイベント */
  let oldScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  window.addEventListener("scroll", function() {
    const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    const distance = oldScrollTop - scrollTop;
    nodes.forEach(node => {
      node.y += distance * node.radius / 100;
    });
    oldScrollTop = scrollTop;
  });

  /* 描画処理 */
  (function draw() {
    if (canvas.parentNode === null) {
      return cancelAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    
    //const gradient = context.createLinearGradient(0, height, width, height);
    const gradient = context.createLinearGradient(width, 0, width, height);
    gradient.addColorStop(0, "#252846");
    gradient.addColorStop(0.5, "#404378");
    gradient.addColorStop(1, "#574a76");
    
    context.shadowColor = "#fff";
    context.shadowBlur = 14;

    context.globalCompositeOperation = "source-over";
    context.fillStyle = gradient;
    context.fillRect(0, 0, width, height);
    context.globalCompositeOperation = "lighter";
    
    nodes.forEach(node => {
      context.beginPath();
      context.arc(node.x, node.y, node.radius - node.lineWidth, 0, Math.PI * 2);
      context.lineWidth = node.lineWidth;
      context.strokeStyle = `rgba(177, 233, 255, ${node.alpha})`;
      context.stroke();
      
      node.x += Math.cos(node.angle) * node.v;
      node.y += Math.sin(node.angle) * node.v;
      
      if(node.x - node.radius > width) {
        node.x = -node.radius;
      }
      if(node.x + node.radius < 0) {
        node.x = width + node.radius;
      }
      if(node.y - node.radius > height) {
        node.y = -node.radius;
      }
      if(node.y + node.radius < 0) {
        node.y = height + node.radius;
      }
    });
  })();
  
});