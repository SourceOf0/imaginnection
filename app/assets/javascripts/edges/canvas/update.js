
/* global $ */
/* global THREE */
/* global accept */
/* global guide */
/* global dom */
/* global db */

var canvas = canvas || {};


canvas.setFocusNode = function( node_name, isScroll ) {
	var data = canvas.data;
	var from_node = canvas.Node.list[node_name];
	
	if( !from_node ) {
		guide.setTour(guide.step.OPEN_NODE_LIST, [guide.step.ADD_NEW_EDGE]);
		return;
	}

	if( data.focusNode ) {
		data.focusNode.setDefaultStyle();
	}
	data.focusNode = from_node;
	data.focusNode.setTargetStyle();
	data.isCameraTargeting = true;
	
	var node_pos = data.focusNode.particle.position.clone().project(data.camera);
	
	// 画面に対する縦横のフェアリングのみにするため、新しいターゲットの奥行き座標だけ先行反映
	var target_pos = data.controls.target.project(data.camera);
	target_pos.z = node_pos.z;
	data.controls.target.copy( target_pos.unproject(data.camera) );
	
	if( node_pos.z > 1 ) {
		data.zoomPos.subVectors( data.focusNode.particle.position, data.camera.position );
		data.zoomPos = data.zoomPos.normalize().negate().multiplyScalar(500).add(data.focusNode.particle.position);
		// ズーム後のカメラ回転を省略するため、新しいターゲットを先行反映
		data.controls.target.copy( node_pos.unproject(data.camera) );
		data.isCameraZoom = true;
	}
	
	$("#associating-view").addClass("active");
	
	guide.setTour(guide.step.CONTROL_MAIN_VIEW, [guide.step.ADD_NEW_NODE, guide.step.ADD_NEW_EDGE]);
	
	if( !isScroll ) return;
	
	dom.scrollNodeList( from_node );
};


canvas.addNode = function( name, from_node ) {
	var node = canvas.Node.create( name, from_node );
	canvas.data.scene.add(node.particle);
	canvas.Node.list[name] = node;
	
	dom.addNodeList( node );
	return node;
};

canvas.removeNode = function( node ) {
	canvas.data.scene.remove(node.particle);
	delete canvas.Node.list[node.name];
	
	dom.removeNodeList( node );
};

canvas.addEdge = function( edge_id, user_id, from_node_name, to_node_name ) {
	var data = canvas.data;
	var from_node = canvas.Node.list[from_node_name];
	var to_node = canvas.Node.list[to_node_name];
	var is_owner = ( user_id === accept.current_id );

	if( !from_node ) {
		from_node = canvas.addNode(from_node_name, null);
		if(!!accept.current_id && !!db.data.users[accept.current_id] && !!db.data.users[accept.current_id]["gaze"] && !!db.data.users[accept.current_id]["gaze"][from_node_name]) {
			canvas.addGaze( from_node_name );
		}
	}
	if( !to_node ) {
		to_node = canvas.addNode(to_node_name, from_node);
		if(!!accept.current_id && !!db.data.users[accept.current_id] && !!db.data.users[accept.current_id]["gaze"] && !!db.data.users[accept.current_id]["gaze"][to_node_name]) {
			canvas.addGaze( to_node_name );
		}
	}
	
	var edge = from_node.getToEdge( to_node );
	if( !edge ) {
		edge = canvas.Edge.create( from_node, to_node );
		if( !edge ) return;
		data.scene.add( edge.line );
		canvas.Edge.list[edge.line.uuid] = edge;
		from_node.addToEdge( edge );
		to_node.addFromEdge( edge );
	}
	if( data.focusNode == from_node ) from_node.setTargetStyle();
	if( is_owner ) edge.setOwner();
	edge.addCount();
	dom.addEdgeList( is_owner, edge );
	
	var hash = window.location.hash;
	if( hash.length > 1 && hash.indexOf("&") < 0 ) {
		hash = decodeURIComponent(hash.substring(1));
		if( hash == from_node_name ) {
			canvas.setFocusNode( decodeURIComponent(from_node_name), true );
			window.location.hash = "";
		} else if( hash == to_node_name ) {
			canvas.setFocusNode( decodeURIComponent(to_node_name), true );
			window.location.hash = "";
		}
	}
};

canvas.removeEdge = function( edge_id, user_id, from_node_name, to_node_name ) {
	var data = canvas.data;
	var from_node = canvas.Node.list[from_node_name];
	var to_node = canvas.Node.list[to_node_name];
	var is_owner = ( user_id === accept.current_id );

	if( from_node && to_node ) {
		var edge = from_node.getToEdge( to_node );
		if( edge ) {
			if( is_owner ) edge.resetOwner();
			edge.decCount();
			dom.removeEdgeList( is_owner, edge );
			if( edge.count == 0 ) {
				data.scene.remove( edge.line );
				delete canvas.Edge.list[edge.line.uuid];
				from_node.removeToEdge( edge );
				to_node.removeFromEdge( edge );
			}
		}
	}

	if( from_node && from_node.edge_count == 0 ) {
		canvas.removeNode(from_node);
		if( data.focusNode == from_node ) data.focusNode = null;
	}
	if( to_node && to_node.edge_count == 0 ) {
		canvas.removeNode(to_node);
		if( data.focusNode == to_node ) data.focusNode = null;
	}
	
	if( !data.focusNode ) {
		$("#associating-view").removeClass("active");
	}
};

canvas.addGaze = function( node_name ) {
	if( !accept.current_id ) return;
	var node = canvas.Node.list[node_name];
	if( !node ) return;
	node.setGaze();
	$("#from-node-index-" + node.index).addClass("gaze").prependTo("#nodes-index");
};

canvas.removeGaze = function( node_name ) {
	if( !accept.current_id ) return;
	var node = canvas.Node.list[node_name];
	if( !node ) return;
	node.resetGaze();
	$("#from-node-index-" + node.index).removeClass("gaze");
};

canvas.setControlTarget = function() {
	var data = canvas.data;
	data.isMouseDown = false;
	if ( data.isDrag ) {
		data.isDrag = false;
		return;
	}
	
	data.raycaster.setFromCamera( data.mouse, data.camera );
	data.raycaster.linePrecision = 5 * data.firstDevicePixelRatio;
	
	var intersects = data.raycaster.intersectObjects( data.scene.children );
	if( intersects.length == 0 ) return;
	
	var node, to_edge, from_edge;
	var focusNode = data.focusNode;
	for( var key in intersects ) {
		var obj = intersects[key].object;
		node = node || canvas.Node.list[obj.name];
		if( focusNode ) {
			from_edge = from_edge || focusNode.from_edges[obj.uuid];
			to_edge = to_edge || focusNode.to_edges[obj.uuid];
		}
	}
	
	if( !node ) {
		if( to_edge ) {
			to_edge.onClick();
		} else if( from_edge ) {
			from_edge.onClick();
		}
		return;
	}
	
	if( focusNode == node ) {
		if( node.is_gaze ) {
			db.removeGaze( node.name );
		} else {
			db.createGaze( node.name );
		}
	} else {
		canvas.setFocusNode( node.name, true );
	}
};


canvas.moveControlTarget = function( pos ) {
	var data = canvas.data;
	var view = document.getElementById('edges-index');
	data.mouse.x = ( pos.clientX / view.clientWidth ) * 2 - 1;
	data.mouse.y = - ( (pos.clientY - 50) / view.clientHeight ) * 2 + 1;

	if( data.isMouseDown && !data.isDrag ) {
		// ドラッグ判定、一定距離を離れた場合はドラッグとして扱う
		data.isDrag = Math.sqrt(Math.pow(data.mouseDownPos.x - pos.clientX, 2) + Math.pow(data.mouseDownPos.y - pos.clientY, 2)) > 5;
	}
};


canvas.resetControlTarget = function() {
	var data = canvas.data;
	data.isCameraTargeting = false;
	data.isDrag = false;
	data.isMouseDown = false;
};


canvas.setZoom = function( ratio ) {
	var data = canvas.data;
	var target_pos = new THREE.Vector3(0, 0, 0);
	if( data.focusNode ) {
		target_pos.copy( data.focusNode.particle.position );
	} else {
		target_pos = new THREE.Vector3(0, 0, 0);
	}
	data.zoomPos.copy( data.camera.position );
	data.delta.subVectors( target_pos, data.camera.position ).multiplyScalar( ratio );
	data.zoomPos.add( data.delta );
	data.isCameraZoom = true;
};


canvas.resetZoom = function() {
	canvas.data.isCameraZoom = false;
};


canvas.animate = function() {
	requestAnimationFrame( canvas.animate );
	canvas.data.controls.update();
	canvas.render();
};


canvas.render = function() {
	var data = canvas.data;
	var nowTime = new Date().getTime();
	var diffCount = (nowTime - data.animeTimer) / 20;
	
	if( data.focusNode ) {
		var target_pos = data.focusNode.particle.position;
		
		if( data.isCameraTargeting ) {
			data.delta.subVectors( target_pos, data.controls.target ).multiplyScalar( diffCount * 0.05 );
			data.controls.target.add( data.delta );
			
			if( target_pos.distanceTo(data.controls.target) < 1 ) {
				data.controls.target.copy(target_pos);
				data.isCameraTargeting = false;
			}
		}
	}
	
	if( data.isCameraZoom ) {
		data.delta.subVectors( data.zoomPos, data.camera.position ).multiplyScalar( diffCount * 0.2 );
		data.camera.position.add( data.delta );
		if( data.zoomPos.distanceTo(data.camera.position) < 5 ) {
			data.isCameraZoom = false;
		}
	}

	var node_list = canvas.Node.list;
	var edge_list = canvas.Edge.list;
	var view = data.container;
	var viewWidth = view.clientWidth;
	var viewHeight = view.clientHeight;
	
	data.context.clearRect(0, 0, viewWidth * data.firstDevicePixelRatio, viewHeight * data.firstDevicePixelRatio);

	for( var key in node_list ) {
		node_list[key].update();
	}
	
	for( var key in edge_list ) {
		edge_list[key].update();
	}
	
	//data.context.shadowColor = "#fff";
	//data.context.shadowBlur = 10;
	
	data.renderer.render( data.scene, data.camera );
	
	var strokeStyle = data.context.strokeStyle;
	var fillStyle = data.context.fillStyle;
	var lineWidth = data.context.lineWidth;
	var globalAlpha = data.context.globalAlpha;
	data.context.lineWidth = 3 * data.firstDevicePixelRatio;
	data.context.globalAlpha = 1;
	data.context.font = "700 " + canvas.NodeLabel.height + "px Unknown Font, sans-serif";
	for( var key in node_list ) {
		node_list[key].labelUpdate( viewWidth * data.firstDevicePixelRatio, viewHeight * data.firstDevicePixelRatio );
	}
	data.context.strokeStyle = strokeStyle;
	data.context.fillStyle = fillStyle;
	data.context.lineWidth = lineWidth;
	data.context.globalAlpha = globalAlpha;
	
	//console.log(nowTime - data.animeTimer);
	data.animeTimer = nowTime;
};

