
/* global $ */
/* global THREE */

/*
 テキスト表示参考：https://codepen.io/dxinteractive/pen/reNpOR
 */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.threeData = {
	scene: null,
	container: null,
	context: null,
	camera: null,
	renderer: null,
	controls: null,
	raycaster: null,
	
	is_drag: false,
	is_mouse_down: false,
	mouse: null,
	mouse_down_pos: new THREE.Vector2(0, 0),
	
	is_camera_zoom: false,
	zoom_pos: new THREE.Vector3(0, 0, 0),
	delta: new THREE.Vector3(0, 0, 0),
	
	focusNode: null,
	is_camera_targeting: false,

	normalColor: 0xffffff,
	ownerColor: 0xb1e9ff,
	gazeColor: 0xffd688,
	
	nodeLineWidth: 0.1,
	edgeDefaultLineWidth: 2,
	edgeTargetLineWidth: 10,
};



imaginnection.three.init = function() {
	let data = imaginnection.threeData;
	
	data.container = document.getElementById('edges-index');
	data.container.style.height = (window.innerHeight - 100) + "px";

	data.camera = new THREE.PerspectiveCamera( 45, data.container.clientWidth / data.container.clientHeight, 1, window.innerWidth * 6 );
	data.camera.position.set( 0, 300, 500 );
	
	data.scene = new THREE.Scene();

	data.raycaster = new THREE.Raycaster();
	data.mouse = new THREE.Vector2();
	data.renderer = new THREE.CanvasRenderer({ alpha: true });
	data.renderer.setPixelRatio( window.devicePixelRatio );
	data.renderer.setSize( data.container.clientWidth, data.container.clientHeight );
	data.container.appendChild( data.renderer.domElement );
	
	data.context = data.renderer.domElement.getContext("2d");
	
	for( let i = 0; i < 20; i++ ) {
		let nodeLabel = imaginnection.three.NodeLabel.create();
		data.container.appendChild(nodeLabel.element);
		imaginnection.three.NodeLabel.list.push(nodeLabel);
	}
	
	data.controls = new THREE.TrackballControls( data.camera, data.container );
	data.controls.center = new THREE.Vector3(0, 0, 0);
	data.controls.rotateSpeed = 1.5;
	data.controls.panSpeed = 0.2;
	data.controls.addEventListener( 'change', imaginnection.three.render );
	
	data.container.addEventListener( 'mousemove', onMouseMove, false );
	data.container.addEventListener( 'touchmove', onTouchMove, false );
	data.container.addEventListener( 'mousedown', onMouseDown, false );
	data.container.addEventListener( 'touchstart', onTouchStart, false );
	data.container.addEventListener( 'mouseup', onMouseUp, false );
	data.container.addEventListener( 'touchend', onTouchEnd, false );
	
	window.addEventListener( 'resize', onWindowResize, false );
	
	//var axis = new THREE.AxesHelper(1000);
	//data.scene.add(axis);
	
	imaginnection.three.animate();
	
	
	$(".zoom-in-button").click(function() {
		imaginnection.three.setZoom(0.4);
		this.blur();
		imaginnection.threeData.container.focus();
		return false;
	});
	$(".zoom-out-button").click(function() {
		imaginnection.three.setZoom(-0.4);
		this.blur();
		imaginnection.threeData.container.focus();
		return false;
	});

	function onWindowResize() {
		let data = imaginnection.threeData;
		let view = document.getElementById('edges-index');
		view.style.height = (window.innerHeight - 100) + "px";
		data.camera.aspect = view.clientWidth / view.clientHeight;
		data.camera.updateProjectionMatrix();
		data.renderer.setSize( view.clientWidth, view.clientHeight );
	}
	
	function onMouseMove( event ) {
		event.preventDefault();
		imaginnection.three.moveControlTarget(event);
		//console.log(is_drag + " onMouseMove:" + mouse.x + ":" + mouse.y);
	}
	
	function onTouchMove( event ) {
		event.preventDefault();
		imaginnection.three.moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchMove:" + mouse.x + ":" + mouse.y);
	}
	
	function onMouseDown( event ) {
		let data = imaginnection.threeData;
		if( event.button == 2 ) {
			// 右ボタンの場合はカメラスライドのため補正しない
			imaginnection.three.resetControlTarget();
			imaginnection.three.resetZoom();
			return;
		}
		data.is_mouse_down = true;
		data.mouse_down_pos.x = event.clientX;
		data.mouse_down_pos.y = event.clientY;
		imaginnection.three.moveControlTarget(event);
		//console.log(is_drag + " onMouseDown:" + mouse_down_pos.x + ":" + mouse_down_pos.y);
	}
	
	function onTouchStart( event ) {
		let data = imaginnection.threeData;
		if( !event.button && event.targetTouches.length > 1 ) {
			// マルチタッチの場合はカメラスライドのため補正しない
			imaginnection.three.resetControlTarget();
			imaginnection.three.resetZoom();
			return;
		}
		data.is_mouse_down = true;
		data.mouse_down_pos.x = event.targetTouches[0].clientX;
		data.mouse_down_pos.y = event.targetTouches[0].clientY;
		imaginnection.three.moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchStart:" + mouse_down_pos.x + ":" + mouse_down_pos.y);
	}
	
	function onMouseUp( event ) {
		if( event.button != 0 ) return;
		// 左ボタンの場合のみ
		imaginnection.three.setControlTarget();
		//console.log(is_drag + " onMouseUp");
	}
	
	function onTouchEnd( event ) {
		if( !event.button || event.targetTouches.length > 0 ) return;
		// シングルタッチの場合のみ
		imaginnection.three.setControlTarget();
		//console.log("onTouchEnd");
	}
};

