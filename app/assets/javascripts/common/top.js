
/* global $ */
/* global Image */

$(document).ready(function() {
  let canvas = document.getElementById("top-canvas");
  if(canvas.parentNode === null) return;
  
  let requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.msRequestAnimationFrame;
  let cancelAnimationFrame = window.cancelAnimationFrame ||
                              window.mozCancelAnimationFrame;
  
  let context = canvas.getContext("2d");

  let width = canvas.clientWidth;
  let height = canvas.clientHeight;

  let time = 0;

  let img = new Image();
  img.src = "logo.png";
  
  let animeCount = [];
  for(let i = 0; i < 12; i++) {
    animeCount.push(0);
  }
  
  /* サイズを設定 */
  function setSize() {
    var devicePixelRatio = window.devicePixelRatio;
  
    var displayWidth  = Math.floor(canvas.clientWidth  * devicePixelRatio);
    var displayHeight = Math.floor(canvas.clientHeight * devicePixelRatio);
  
    // canvasの描画バッファサイズと表示サイズが異なるか
    if (canvas.width  !== displayWidth ||
        canvas.height !== displayHeight) {
  
      // サイズが違っていたら、同じサイズに
      canvas.width  = displayWidth;
      canvas.height = displayHeight;
    }
    
    width = canvas.width;
    height = canvas.height;
  }
  setSize();
  
  /* リサイズイベント */
  window.addEventListener("resize", function() {
    setSize();
  });
  
  /* スクロールイベント */
  let oldScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  window.addEventListener("scroll", function() {
    let scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
    let border = canvas.clientHeight + 50;
    if( (scrollTop < border) && (oldScrollTop > border) ) {
      time = 0;
      for(let i = 0; i < animeCount.length; i++) {
        animeCount[i] = 0;
      }
    }
    oldScrollTop = scrollTop;
  });
  
  /* フォントサイズ設定 */
  function setFont(message, x, y, r, g, b, alpha) {
    context.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    context.fillText(message, width * 0.5 - context.measureText(message).width/2 + x, y);
  }

  /* フォントロードチェック */
  function loadedFont() {
    let message = "テスト test てすと";
    
    context.font = "700 100px 'Rounded Mplus 1c', '游ゴシック'";
    let mainWidth = context.measureText(message).width;
    
    context.font = "700 100px '游ゴシック'";
    let subWidth = context.measureText(message).width;

    return mainWidth != subWidth;
  }
  
  /* 描画処理 */
  (function draw() {
    if(!canvas.parentNode) {
      return cancelAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
    
    context.clearRect(0, 0, width, height);
    
    if(!loadedFont()) return;
    /*
    context.beginPath();
    context.lineWidth = 10;
    context.strokeStyle = `rgba(255, 255, 255, 0.5)`;
    context.arc(70, 70, 60, 0, Math.PI*2, false);
    context.stroke();
    */
    context.font = "700 " + height * 0.1 + "px 'Rounded Mplus 1c', '游ゴシック'";
    
    let ratio = 0.15;
    setFont("イメージを", 0, height * ratio, 255, 255, 255, animeCount[0] - animeCount[7]);
    ratio += 0.25;
    setFont("連ねて"    , 0, height * ratio, 255, 255, 255, animeCount[1] - animeCount[7]);
    ratio += 0.25;
    setFont("繋がろう"  , 0, height * ratio, 255, 255, 255, animeCount[2] - animeCount[7]);

    context.font = "700 " + (height * (0.06 + animeCount[8] * 0.18)) + "px 'Rounded Mplus 1c'";
    
    ratio = 0.23;
    setFont("imagination", 0, height * (ratio + ((0.55 - ratio) * animeCount[8])), 177, 233, 255, animeCount[4] - animeCount[9]);
    ratio += 0.25;
    setFont("association", 0, height * (ratio + ((0.55 - ratio) * animeCount[8])), 177, 233, 255, animeCount[5] - animeCount[9]);
    ratio += 0.25;
    setFont("connection" , 0, height * (ratio + ((0.55 - ratio) * animeCount[8])), 177, 233, 255, animeCount[6] - animeCount[9]);
    
    //context.font = "700 " + height * 0.2 + "px 'Rounded Mplus 1c'";
    //setFont("Imaginnection", 0, height * 0.5, 177, 233, 255, animeCount[10]);
    
    context.font = "700 " + height * 0.07 + "px 'Rounded Mplus 1c'";
    setFont("い　ま　じ　ね　く　し　ょ　ん", 0, height * 0.2, 177, 233, 255, animeCount[11]);
    
    context.font = "700 " + height * 0.06 + "px 'Rounded Mplus 1c'";
    setFont("イメージを 連ねて 繋がろう", 0, height * 0.8, 177, 233, 255, animeCount[11]);
    
    if(animeCount[10] > 0) {
      context.globalAlpha = animeCount[10];
      context.drawImage(img, Math.round(width * 0.5 - width/2), Math.round(height * 0.25), Math.round(width), Math.round(width * 0.24));
    } else {
      context.globalAlpha = 1.0;
      context.drawImage(img, 0, 0, 0, 0);
    }
    
    if(animeCount[9] > 0) {
      time = (time + 1) % 300;
      let blur = Math.abs(time - 150) + 1;
      context.shadowColor = "#b1e9ff";
      context.shadowBlur = blur * 0.2;
    }
    
    context.globalCompositeOperation = "lighter";
    
    for(let i = 0; i < animeCount.length; i++) {
      if(animeCount[i] < 1.0) {
        animeCount[i] = Math.min(animeCount[i] + 0.02, 1.0);
        break;
      }
    }
    
  })();
  
});