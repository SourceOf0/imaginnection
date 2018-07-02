
/* global $ */
/* global THREE */

/*
 テキスト表示参考：https://codepen.io/dxinteractive/pen/reNpOR
 */

var PI2 = Math.PI * 2;
var imaginnection = imaginnection || {};
imaginnection.three = {};

imaginnection.three.NodeLabel = {
	
	list: [],
	
  create: function() {
    var div = document.createElement('div');
    div.className = 'text-label';
    div.style.position = 'absolute';

    return {
      element: div,
      width: 300,
      height: 16,
      node: null,
      position: new THREE.Vector3(0,0,0),
      hide: function() {
				this.element.style.display = "none";
      },
      updatePosition: function( node, camera, viewWidth, viewHeight ) {
				if( node == null ) {
					this.hide();
					return false;
				}

        this.position.copy(node.particle.position);
        var vector = this.position.project(camera);
        
        if( (vector.z*1000 > 997) || ((vector.x < -0.5 || vector.x > 0.5) || (vector.y < -0.9 || vector.y > 0.9)) ) {
					this.hide();
					return false;
        }
        
        this.node = node;
        if( this.element.innerHTML != node.name ) this.element.innerHTML = node.name;
        
        vector.x = (vector.x + 1)/2 * viewWidth - this.width/2;
        vector.y = -(vector.y - 1)/2 * viewHeight - this.height/2;

				this.element.style.left = vector.x + 'px';
				this.element.style.top = (vector.y + 50) + 'px';
				this.element.style.display = "block";
				return true;
      },
    };
  },
  
};


imaginnection.three.Node = {
	
	count: 0,
	list: {},
	org1: new THREE.Vector3(0, 1, 0),
	org2: new THREE.Vector3(0, 0, 1),
	
	programFill: function( context ) {
		context.lineWidth = 0.05;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.fill();
	},
	
	programStroke: function( context ) {
		//context.globalAlpha = 0.5;
		context.lineWidth = 0.05;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.stroke();
	},
	
  create: function( name, isOwner, size, index, fromNode ) {
		let pos = new THREE.Vector3( ((this.count % 6 / 6) * 20 + 4) * 10 + 30, 0, 0);
		if( fromNode ) {
			//pos.add(fromNode.particle.position);
			//pos.applyAxisAngle( this.org1, PI2/4 );
		} else {
			//pos.y -= this.count % 50 / 50 * 20;
			//pos.applyAxisAngle( this.org1, (this.count % 50 / 50) * PI2 );
			//pos.applyAxisAngle( this.org2, (this.count % 7 / 7) * PI2/2 );
		}
		pos.applyAxisAngle( this.org1, (this.count % 50 / 50) * PI2 );
		pos.applyAxisAngle( this.org2, (this.count % 7 / 7) * PI2/2 );
  	
  	let color = (isOwner)? 0xaaaaff : 0xffffff;
		let particle = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: color, program: imaginnection.three.Node.programStroke } ) );
		particle.position.copy(pos);
		particle.scale.x = particle.scale.y = size;
		particle.name = name;
		
		this.count++;

    return {
			name: name,
			isOwner: isOwner,
			particle: particle,
			fromLines: [],
			toLines: [],
			addToLine: function( node, isExist ) {
				if( !node ) return;
				this.particle.scale.x += 10; 
				this.particle.scale.y += 10;
				if( isExist ) return null;
		  	let color = (isOwner)? 0xaaaaff : 0xffffff;
				let point = node.particle.position;
				let geometry = new THREE.BufferGeometry().setFromPoints( [point, particle.position] );
				let line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: color, opacity: 0.5, linewidth: 1 } ) );
				this.toLines.push(line);
				return line;
			},
			addFromLine: function( line ) {
				this.particle.scale.x += 10; 
				this.particle.scale.y += 10;
				if( line ) {
					this.fromLines.push(line);
				}
			},
			setTargetStyle: function() {
				this.particle.material.program = imaginnection.three.Node.programFill;
				this.toLines.forEach(function( line ) {
					line.material.linewidth = 10;
					line.material.opacity = 1;
				});
			},
			setDefaultStyle: function() {
				this.particle.material.program = imaginnection.three.Node.programStroke;
				this.toLines.forEach(function( line ) {
					line.material.linewidth = 1;
					line.material.opacity = 0.5;
				});
			},
			setFromOwner: function( isOwner ) {
				if(this.isOwner == isOwner) return;
				this.isOwner = isOwner;
		  	let color = (isOwner)? 0xaaaaff : 0xffffff;
		  	this.particle.material.color = new THREE.Color(color);
			},
			setToOwner: function( isOwner ) {
				if(this.isOwner == isOwner) return;
				this.isOwner = isOwner;
		  	let color = (isOwner)? 0xaaaaff : 0xffffff;
		  	this.particle.material.color = new THREE.Color(color);
				//this.toLines.forEach(function( line ) {
					//line.material.color = new THREE.Color(color);
				//});
			},
    };
  }
};


imaginnection.three.addEdge = function(user_id, from_node_name, to_node_name) {
	let from_node = imaginnection.three.Node.list[from_node_name];
	let to_node = imaginnection.three.Node.list[to_node_name];
  let isOwner = ( user_id === imaginnection.current_id );
  let isExist = from_node && to_node;
  
  if( from_node ) {
  	from_node.setFromOwner(isOwner);
  } else {
		from_node = imaginnection.three.Node.create(from_node_name, isOwner, 10, 0, null);
		imaginnection.three.scene.add(from_node.particle);
		imaginnection.three.Node.list[from_node_name] = from_node;
	}
	if( to_node ) {
  	to_node.setToOwner(isOwner);
	} else {
		to_node = imaginnection.three.Node.create(to_node_name, isOwner, 10, from_node.toLines.length, from_node);
		imaginnection.three.scene.add(to_node.particle);
		imaginnection.three.Node.list[to_node_name] = to_node;
	}
	let line = from_node.addToLine( to_node, isExist );
	to_node.addFromLine( line );
	if( line ) {
		imaginnection.three.scene.add( line );
	}
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
		var container = document.createElement( 'div' );
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
		var view = document.getElementById('edges-index');
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

		var count = 0;
		var view = document.getElementById('edges-index');
		for( var key in imaginnection.three.Node.list ) {
      if( count >= imaginnection.three.NodeLabel.list.length ) break;
      if( imaginnection.three.NodeLabel.list[count].updatePosition(imaginnection.three.Node.list[key], camera, view.clientWidth, view.clientHeight) ) {
      	count++;
      }
    }
    for( ; count < imaginnection.three.NodeLabel.list.length; count++ ) {
    	imaginnection.three.NodeLabel.list[count].updatePosition(null, camera, view.clientWidth, view.clientHeight);
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
		
		var intersects = raycaster.intersectObjects( imaginnection.three.scene.children );
		if( intersects.length == 0 ) return;

		var result;
		for( var key in intersects ) {
			result = result || imaginnection.three.Node.list[intersects[key].object.name];
		}
		if( !result ) return;

		if( INTERSECTED == result ) return;

		if( INTERSECTED ) {
			INTERSECTED.setDefaultStyle();
		}
		INTERSECTED = result;
		INTERSECTED.setTargetStyle();
		target_pos = INTERSECTED.particle.position;
		is_camera_targeting = true;
	}
	
	function moveControlTarget( pos ) {
		if( !is_mouse_down ) return;
		
		var view = document.getElementById('edges-index');
		mouse.x = ( pos.clientX / view.clientWidth ) * 2 - 1;
		mouse.y = - ( (pos.clientY - 50) / view.clientHeight ) * 2 + 1;
		
		if( !is_drag ) {
			// 一定距離を離れた場合はドラッグとして扱う
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
