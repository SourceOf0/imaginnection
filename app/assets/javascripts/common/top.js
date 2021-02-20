
/* global $ */
/* global Image */

$(document).ready(function() {
	var canvas = document.getElementById("top-canvas");
	if(canvas.parentNode === null) return;
	
	var requestAnimationFrame = window.requestAnimationFrame ||
															window.mozRequestAnimationFrame ||
															window.webkitRequestAnimationFrame ||
															window.msRequestAnimationFrame;
	var cancelAnimationFrame = window.cancelAnimationFrame ||
															window.mozCancelAnimationFrame;
	
	var context = canvas.getContext("2d");

	var width = canvas.clientWidth;
	var height = canvas.clientHeight;

	var fadeTime = 0;

	var img = new Image();
	img.addEventListener("load", function() {
		draw();
	});
	img.src = "logo.png";
	
	var animeCount = [];
	for(var i = 0; i < 12; i++) {
		animeCount.push(0);
	}
	
	/* サイズを設定 */
	function setSize() {
		var devicePixelRatio = window.devicePixelRatio;
	
		var displayWidth	= Math.floor(canvas.clientWidth	* devicePixelRatio);
		var displayHeight = Math.floor(canvas.clientHeight * devicePixelRatio);
	
		// canvasの描画バッファサイズと表示サイズが異なるか
		if (canvas.width	!== displayWidth ||
				canvas.height !== displayHeight) {
	
			// サイズが違っていたら、同じサイズに
			canvas.width	= displayWidth;
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
	var oldScrollTop = document.documentElement.scrollTop || document.body.scrollTop;
	window.addEventListener("scroll", function() {
		var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
		var border = canvas.clientHeight + 50;
		if( (scrollTop < border) && (oldScrollTop > border) ) {
			fadeTime = 0;
			for(var i = 0; i < animeCount.length; i++) {
				animeCount[i] = 0;
			}
		}
		oldScrollTop = scrollTop;
	});
	
	/* フォントサイズ設定 */
	function setFont(message, x, y, r, g, b, alpha) {
		context.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
		context.fillText(message, width * 0.5 - context.measureText(message).width/2 + x, y);
	}

	/* フォントロードチェック */
	function loadedFont() {
		var message = "テスト test てすと";
		
		context.font = "700 100px 'Rounded Mplus 1c', '游ゴシック'";
		var mainWidth = context.measureText(message).width;
		
		context.font = "700 100px '游ゴシック'";
		var subWidth = context.measureText(message).width;

		return mainWidth != subWidth;
	}
	
	/* 描画処理 */
	var timeCount = new Date().getTime();
	function draw() {
		if(!canvas.parentNode) {
			return cancelAnimationFrame(draw);
		}
		requestAnimationFrame(draw);
		
		context.clearRect(0, 0, width, height);
		
		if(!loadedFont()) return;
		/*
		context.beginPath();
		context.lineWidth = 10;
		context.strokeStyle = "rgba(255, 255, 255, 0.5)";
		context.arc(70, 70, 60, 0, Math.PI*2, false);
		context.stroke();
		*/
		context.font = "700 " + height * 0.1 + "px 'Rounded Mplus 1c', '游ゴシック'";
		
		var ratio = 0.15;
		setFont("イメージを", 0, height * ratio, 255, 255, 255, animeCount[0] - animeCount[7]);
		ratio += 0.25;
		setFont("連ねて"		, 0, height * ratio, 255, 255, 255, animeCount[1] - animeCount[7]);
		ratio += 0.25;
		setFont("繋がろう"	, 0, height * ratio, 255, 255, 255, animeCount[2] - animeCount[7]);

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
		setFont("い	ま	じ	ね	く	し	ょ	ん", 0, height * 0.2, 177, 233, 255, animeCount[11]);
		
		context.font = "700 " + height * 0.06 + "px 'Rounded Mplus 1c'";
		setFont("イメージを 連ねて 繋がろう", 0, height * 0.8, 177, 233, 255, animeCount[11]);
		
		if(animeCount[10] > 0) {
			context.globalAlpha = animeCount[10];
			context.drawImage(img, Math.round(width * 0.5 - width/2), Math.round(height * 0.25), Math.round(width), Math.round(width * 0.24));
		} else {
			context.globalAlpha = 1.0;
			context.drawImage(img, 0, 0, 0, 0);
		}
		
		var nowTimeCount = new Date().getTime();
		var diffCount = (nowTimeCount - timeCount);
		if(animeCount[9] > 0) {
			fadeTime = (fadeTime + diffCount * 0.1) % 300;
			var blur = Math.abs(fadeTime - 150) + 1;
			context.shadowColor = "#b1e9ff";
			context.shadowBlur = blur * 0.2;
		}
		
		context.globalCompositeOperation = "lighter";
		
		for(var i = 0; i < animeCount.length; i++) {
			if(animeCount[i] < 1.0) {
				animeCount[i] = Math.min(animeCount[i] + diffCount * 0.001, 1.0);
				break;
			}
		}
		timeCount = nowTimeCount;
	
	};
	
});
