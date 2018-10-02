
/* global $ */
/* global THREE */

/*
 テキスト表示参考：https://codepen.io/dxinteractive/pen/reNpOR
 */

var canvas = canvas || {};


canvas.data = {
	scene: null,
	container: null,
	context: null,
	camera: null,
	renderer: null,
	controls: null,
	raycaster: null,
	firstDevicePixelRatio: window.devicePixelRatio,

	isDrag: false,
	isMouseDown: false,
	mouse: null,
	mouseDownPos: new THREE.Vector2(0, 0),
	
	isCameraZoom: false,
	zoomPos: new THREE.Vector3(0, 0, 0),
	delta: new THREE.Vector3(0, 0, 0),
	labelViewTargetPos: new THREE.Vector3(0, 0, -10),
	
	focusNode: null,
	isCameraTargeting: false,

	normalColor: 0xffffff,
	ownerColor: 0xb1e9ff,
	gazeColor: 0xffd688,
	
	nodeLineWidth: 0.1,
	edgeDefaultLineWidth: 1 * window.devicePixelRatio,
	edgeTargetLineWidth: 10 * window.devicePixelRatio,
	
	animeTimer: new Date().getTime(),
};



canvas.init = function() {
	var data = canvas.data;

	data.container = document.getElementById('edges-index');
	data.container.style.height = (window.innerHeight - 100) + "px";

	data.camera = new THREE.PerspectiveCamera( 45, data.container.clientWidth / data.container.clientHeight, 1, 100000 );
	data.camera.position.set( 0, 0, -1700 );
	
	data.scene = new THREE.Scene();

	data.raycaster = new THREE.Raycaster();
	data.mouse = new THREE.Vector2();
	data.renderer = new THREE.CanvasRenderer({ alpha: true });
	data.renderer.setPixelRatio( window.devicePixelRatio );
	data.renderer.setSize( data.container.clientWidth, data.container.clientHeight );
	data.container.appendChild( data.renderer.domElement );
	
	data.context = data.renderer.domElement.getContext("2d");

	data.controls = new THREE.TrackballControls( data.camera, data.container );
	data.controls.center = new THREE.Vector3(0, 0, 0);
	data.controls.rotateSpeed = 1.5;
	data.controls.panSpeed = 0.2;
	data.controls.addEventListener( 'change', canvas.render );
	
	data.container.addEventListener( 'mousemove', onMouseMove, false );
	data.container.addEventListener( 'touchmove', onTouchMove, false );
	data.container.addEventListener( 'mousedown', onMouseDown, false );
	data.container.addEventListener( 'touchstart', onTouchStart, false );
	data.container.addEventListener( 'mouseup', onMouseUp, false );
	data.container.addEventListener( 'touchend', onTouchEnd, false );
	
	window.addEventListener( 'resize', onWindowResize, false );
	window.addEventListener( 'orientationchange', onWindowResize, false );

	//var axis = new THREE.AxesHelper(1000);
	//data.scene.add(axis);
	
	canvas.animate();
	
	
	$(".zoom-in-button").click(function() {
		canvas.setZoom(0.4);
		this.blur();
		canvas.data.container.focus();
		return false;
	});
	$(".zoom-out-button").click(function() {
		canvas.setZoom(-0.4);
		this.blur();
		canvas.data.container.focus();
		return false;
	});

	function onWindowResize() {
		setTimeout(function(){
			var data = canvas.data;
			var view = data.container;
			view.style.height = (window.innerHeight - 100) + "px";
			data.camera.aspect = view.clientWidth / view.clientHeight;
			data.camera.updateProjectionMatrix();
			data.renderer.setSize( view.clientWidth, view.clientHeight );
		}, 100);
	}
	
	function onMouseMove( event ) {
		event.preventDefault();
		canvas.moveControlTarget(event);
		//console.log(canvas.data.isDrag + " onMouseMove:" + canvas.data.mouse.x + ":" + canvas.data.mouse.y);
	}
	
	function onTouchMove( event ) {
		event.preventDefault();
		canvas.moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchMove:" + canvas.data.mouse.x + ":" + canvas.data.mouse.y);
	}
	
	function onMouseDown( event ) {
		var data = canvas.data;
		if( event.button == 2 ) {
			// 右ボタンの場合はカメラスライドのため補正しない
			canvas.resetControlTarget();
			canvas.resetZoom();
			return;
		}
		data.isMouseDown = true;
		data.mouseDownPos.x = event.clientX;
		data.mouseDownPos.y = event.clientY;
		canvas.moveControlTarget(event);
		//console.log(canvas.data.isDrag + " onMouseDown:" + canvas.data.mouse.x + ":" + canvas.data.mouse.y);
	}
	
	function onTouchStart( event ) {
		var data = canvas.data;
		if( !event.button && event.targetTouches.length > 1 ) {
			// マルチタッチの場合はカメラスライドのため補正しない
			canvas.resetControlTarget();
			canvas.resetZoom();
			return;
		}
		data.isMouseDown = true;
		data.mouseDownPos.x = event.targetTouches[0].clientX;
		data.mouseDownPos.y = event.targetTouches[0].clientY;
		canvas.moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchStart:" + canvas.data.mouse.x + ":" + canvas.data.mouse.y);
	}
	
	function onMouseUp( event ) {
		if( event.button != 0 ) return;
		// 左ボタンの場合のみ
		canvas.setControlTarget();
		//console.log(canvas.data.isDrag + " onMouseUp");
	}
	
	function onTouchEnd( event ) {
		if( !event.button || event.targetTouches.length > 0 ) return;
		// シングルタッチの場合のみ
		canvas.setControlTarget();
		//console.log("onTouchEnd");
	}
};
