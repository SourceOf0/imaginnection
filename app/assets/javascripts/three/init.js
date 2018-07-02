
/* global $ */
/* global THREE */

/*
 テキスト表示参考：https://codepen.io/dxinteractive/pen/reNpOR
 */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.addEdge = function( user_id, from_node_name, to_node_name ) {
	let from_node = imaginnection.three.Node.list[from_node_name];
	let to_node = imaginnection.three.Node.list[to_node_name];
	let is_owner = ( user_id === imaginnection.current_id );

	if( !from_node ) {
		from_node = imaginnection.three.Node.create(from_node_name, 0);
		imaginnection.three.scene.add(from_node.particle);
		imaginnection.three.Node.list[from_node_name] = from_node;
	}
	if( !to_node ) {
		to_node = imaginnection.three.Node.create(to_node_name, from_node.edge_count);
		imaginnection.three.scene.add(to_node.particle);
		imaginnection.three.Node.list[to_node_name] = to_node;
	}
	
	if( is_owner ) {
		from_node.setOwner( to_node );
	}
	
	let edge = from_node.getToEdge( to_node );
	if( !edge ) {
		edge = imaginnection.three.Edge.create( is_owner, from_node, to_node );
		imaginnection.three.scene.add( edge.line );
		imaginnection.three.Edge.list[edge.line.uuid] = edge;
	}
	from_node.addToEdge( edge );
	to_node.addFromEdge( edge );
};


imaginnection.three.initView = function() {
	
	var camera, renderer;
	var controls;
	var raycaster;
	
	var is_drag = false;
	var is_mouse_down = false;
	var mouse;
	var mouse_down_pos = new THREE.Vector2(0, 0);
	
	var is_camera_targeting = false;
	var target_pos = new THREE.Vector3(0, 0, 0);
	var is_camera_zoom = false;
	var zoom_pos = new THREE.Vector3(0, 0, 0);
	var delta = new THREE.Vector3(0, 0, 0);
	
	var INTERSECTED;
	
	init();
	animate();
	
	function init() {
		let container = document.createElement( 'div' );
		let view = document.getElementById('edges-index');
		view.style.height = (window.innerHeight - 100) + "px";
		view.appendChild(container);

		camera = new THREE.PerspectiveCamera( 45, view.clientWidth / view.clientHeight, 1, 1500 );
		camera.position.set( 0, 300, 500 );
		
		imaginnection.three.scene = new THREE.Scene();
		imaginnection.three.scene.background = new THREE.Color( 0x666666 );
		
		raycaster = new THREE.Raycaster();
		mouse = new THREE.Vector2();
		renderer = new THREE.CanvasRenderer();
		renderer.setPixelRatio( window.devicePixelRatio );
		renderer.setSize( view.clientWidth, view.clientHeight );
		container.appendChild( renderer.domElement );
		
		for( let i = 0; i < 20; i++ ) {
			let nodeLabel = imaginnection.three.NodeLabel.create();
			container.appendChild(nodeLabel.element);
			imaginnection.three.NodeLabel.list.push(nodeLabel);
		}
		
		controls = new THREE.TrackballControls( camera, container );
		controls.center = new THREE.Vector3(0, 0, 0);
		controls.rotateSpeed = 1.5;
		controls.panSpeed = 0.2;
		controls.addEventListener( 'change', render );
		
		container.addEventListener('mousemove', onMouseMove, false );
		container.addEventListener('touchmove', onTouchMove, false );
		container.addEventListener('mousedown', onMouseDown, false );
		container.addEventListener('touchstart', onTouchStart, false );
		container.addEventListener('mouseup', onMouseUp, false );
		container.addEventListener('touchend', onTouchEnd, false );
		
		imaginnection.three.container = container;
		
		window.addEventListener( 'resize', onWindowResize, false );
	}
	
	function onWindowResize() {
		let view = document.getElementById('edges-index');
		view.style.height = (window.innerHeight - 100) + "px";
		camera.aspect = view.clientWidth / view.clientHeight;
		camera.updateProjectionMatrix();
		renderer.setSize( view.clientWidth, view.clientHeight );
	}
	
	function onMouseMove( event ) {
		event.preventDefault();
		moveControlTarget(event);
		//console.log(is_drag + " onMouseMove:" + mouse.x + ":" + mouse.y);
	}
	
	function onTouchMove( event ) {
		event.preventDefault();
		moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchMove:" + mouse.x + ":" + mouse.y);
	}
	
	function onMouseDown( event ) {
		if( event.button == 2 ) {
			// 右ボタンの場合はカメラスライドのため補正しない
			resetControlTarget();
			resetZoom();
			return;
		}
		is_mouse_down = true;
		mouse_down_pos.x = event.clientX;
		mouse_down_pos.y = event.clientY;
		moveControlTarget(event);
		//console.log(is_drag + " onMouseDown:" + mouse_down_pos.x + ":" + mouse_down_pos.y);
	}
	
	function onTouchStart( event ) {
		if( !event.button && event.targetTouches.length > 1 ) {
			// マルチタッチの場合はカメラスライドのため補正しない
			resetControlTarget();
			resetZoom();
			return;
		}
		is_mouse_down = true;
		mouse_down_pos.x = event.targetTouches[0].clientX;
		mouse_down_pos.y = event.targetTouches[0].clientY;
		moveControlTarget(event.targetTouches[0]);
		//console.log("onTouchStart:" + mouse_down_pos.x + ":" + mouse_down_pos.y);
	}

	function onMouseUp( event ) {
		if( event.button != 0 ) return;
		// 左ボタンの場合のみ
		setControlTarget();
		//console.log(is_drag + " onMouseUp");
	}
	
	function onTouchEnd( event ) {
		if( !event.button || event.targetTouches.length > 0 ) return;
		// シングルタッチの場合のみ
		setControlTarget();
		//console.log("onTouchEnd");
	}
	
	
	function animate() {
		requestAnimationFrame( animate );
		controls.update();
		render();
	}
	
	function render() {
		if( is_camera_targeting ) {
			delta.subVectors( target_pos, controls.target ).multiplyScalar( 0.05 );
			controls.target.add( delta );
			if( target_pos.distanceTo(controls.target) < 1 ) {
				controls.target.copy(target_pos);
				is_camera_targeting = false;
			}
		}
		if( is_camera_zoom ) {
			delta.subVectors( zoom_pos, camera.position ).multiplyScalar( 0.2 );
			camera.position.add( delta );
			if( zoom_pos.distanceTo(camera.position) < 5 ) {
				is_camera_zoom = false;
			}
		}

		let count = 0;
		let view = document.getElementById('edges-index');
		let node_list = imaginnection.three.Node.list;
		let node_label_list = imaginnection.three.NodeLabel.list;
		for( let key in node_list ) {
			let node = node_list[key];
			node.update();
			if( count >= node_label_list.length ) continue;
			let node_label = node_label_list[count];
			if( node_label.update(node, camera, view.clientWidth, view.clientHeight) ) {
				count++;
			}
		}
		for( ; count < node_label_list.length; count++ ) {
			node_label_list[count].update(null, camera, view.clientWidth, view.clientHeight);
		}
		
		let edge_list = imaginnection.three.Edge.list;
		for( let key in edge_list ) {
			edge_list[key].update();
		}
	
		renderer.render( imaginnection.three.scene, camera );
	}
	
	
	function setControlTarget() {
		is_mouse_down = false;
		if ( is_drag ) {
			is_drag = false;
			return;
		}
		raycaster.setFromCamera( mouse, camera );
		
		let intersects = raycaster.intersectObjects( imaginnection.three.scene.children );
		if( intersects.length == 0 ) return;

		let node, edge;
		for( let key in intersects ) {
			let obj = intersects[key].object;
			node = node || imaginnection.three.Node.list[obj.name];
			if( INTERSECTED && !edge ) {
				edge = INTERSECTED.to_edges[obj.uuid] || INTERSECTED.from_edges[obj.uuid];
			}
		}
		if( !node ) {
			if( edge ) edge.onClick();
			return;
		}

		if( INTERSECTED == node ) {
			console.log("same");
			return;
		}

		if( INTERSECTED ) {
			INTERSECTED.setDefaultStyle();
		}
		INTERSECTED = node;
		INTERSECTED.setTargetStyle();
		target_pos = INTERSECTED.particle.position;
		is_camera_targeting = true;
	}
	
	function moveControlTarget( pos ) {
		let view = document.getElementById('edges-index');
		mouse.x = ( pos.clientX / view.clientWidth ) * 2 - 1;
		mouse.y = - ( (pos.clientY - 50) / view.clientHeight ) * 2 + 1;

		if( is_mouse_down && !is_drag ) {
			// ドラッグ判定、一定距離を離れた場合はドラッグとして扱う
			is_drag = Math.sqrt(Math.pow(mouse_down_pos.x - pos.clientX, 2) + Math.pow(mouse_down_pos.y - pos.clientY, 2)) > 5;
		}
	}
	
	function resetControlTarget() {
		is_camera_targeting = false;
		is_drag = false;
		is_mouse_down = false;
	}
	
	function setZoom( ratio ) {
		zoom_pos.copy(camera.position);
		delta.subVectors( target_pos, camera.position ).multiplyScalar( ratio );
		zoom_pos.add( delta );
		is_camera_zoom = true;
		render();
	}
	
	function resetZoom() {
		is_camera_zoom = false;
	}
	
	
	$(".zoom-in-button").click(function() {
		setZoom(-0.4);
		this.blur();
		imaginnection.three.container.focus();
		return false;
	});
	$(".zoom-out-button").click(function() {
		setZoom(0.4);
		this.blur();
		imaginnection.three.container.focus();
		return false;
	});
};
