
/* global $ */
/* global THREE */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.setFocusNode = function( node_name, isScroll ) {
	var data = imaginnection.threeData;
	var from_node = imaginnection.three.Node.list[node_name];
	if( !from_node ) return;

	if( data.focusNode ) {
		data.focusNode.setDefaultStyle();
	}
	data.focusNode = from_node;
	data.focusNode.setTargetStyle();
	data.isCameraTargeting = true;
	var vector = data.focusNode.particle.position.clone().project(data.camera);
	if( vector.z > 1 ) {
		data.zoomPos.subVectors( data.focusNode.particle.position, data.camera.position );
		data.zoomPos = data.zoomPos.normalize().negate().multiplyScalar(500).add(data.focusNode.particle.position);
		data.isCameraZoom = true;
	}
	
	$("#associating-view").addClass("active");
	
	if( !isScroll ) return;
	
	var $box = $("#drawer .drawer-body");
	var $target = $("#from-node-index-" + from_node.index);
	var $list = $("#nodes-index");
	var index = $list.children().index($target);
	var pos = $box.scrollTop() + ($list.offset().top + $target.outerHeight(true) * index) - $box.offset().top - 10;

	$("#from-node-list-" + from_node.index).collapse("show");
	$box.stop().animate({ scrollTop: pos }, 500, "swing");
};


imaginnection.three.addNode = function( name, edge_count ) {
	var node = imaginnection.three.Node.create( name, edge_count );
	imaginnection.threeData.scene.add(node.particle);
	imaginnection.three.Node.list[name] = node;
	
	imaginnection.three.addNodeList( node );
	return node;
};

imaginnection.three.removeNode = function( node ) {
	imaginnection.threeData.scene.remove(node.particle);
	delete imaginnection.three.Node.list[node.name];
	
	imaginnection.three.removeNodeList( node );
};

imaginnection.three.addEdge = function( edge_id, user_id, from_node_name, to_node_name ) {
	var data = imaginnection.threeData;
	var from_node = imaginnection.three.Node.list[from_node_name];
	var to_node = imaginnection.three.Node.list[to_node_name];
	var is_owner = ( user_id === imaginnection.current_id );

	if( !from_node ) {
		from_node = imaginnection.three.addNode(from_node_name, 0);
	}
	if( !to_node ) {
		to_node = imaginnection.three.addNode(to_node_name, from_node.edge_count);
	}
	
	var edge = from_node.getToEdge( to_node );
	if( !edge ) {
		edge = imaginnection.three.Edge.create( from_node, to_node );
		if( !edge ) return;
		data.scene.add( edge.line );
		imaginnection.three.Edge.list[edge.line.uuid] = edge;
		from_node.addToEdge( edge );
		to_node.addFromEdge( edge );
	}
	if( is_owner ) edge.setOwner();
	edge.addCount();
	imaginnection.three.addEdgeList( is_owner, edge );
	
	var hash = decodeURIComponent(window.location.hash.substring(1));
  if( hash == from_node_name ) {
    imaginnection.three.setFocusNode( decodeURIComponent(from_node_name), true );
    window.location.hash = "";
  } else if( hash == to_node_name ) {
    imaginnection.three.setFocusNode( decodeURIComponent(to_node_name), true );
    window.location.hash = "";
  }
};

imaginnection.three.removeEdge = function( edge_id, user_id, from_node_name, to_node_name ) {
	var data = imaginnection.threeData;
	var from_node = imaginnection.three.Node.list[from_node_name];
	var to_node = imaginnection.three.Node.list[to_node_name];
	var is_owner = ( user_id === imaginnection.current_id );

	if( from_node && to_node ) {
		var edge = from_node.getToEdge( to_node );
		if( edge ) {
			if( is_owner ) edge.resetOwner();
			edge.decCount();
			imaginnection.three.removeEdgeList( is_owner, edge );
			if( edge.count == 0 ) {
				data.scene.remove( edge.line );
				delete imaginnection.three.Edge.list[edge.line.uuid];
				from_node.removeToEdge( edge );
				to_node.removeFromEdge( edge );
			}
		}
	}

	if( from_node && from_node.edge_count == 0 ) {
		imaginnection.three.removeNode(from_node);
		if( data.focusNode == from_node ) data.focusNode = null;
	}
	if( to_node && to_node.edge_count == 0  ) {
		imaginnection.three.removeNode(to_node);
		if( data.focusNode == to_node ) data.focusNode = null;
	}
	
	if( !data.focusNode ) {
		$("#associating-view").removeClass("active");
	}
};

imaginnection.three.setControlTarget = function() {
	var data = imaginnection.threeData;
	data.isMouseDown = false;
	if ( data.isDrag ) {
		data.isDrag = false;
		return;
	}
	data.raycaster.setFromCamera( data.mouse, data.camera );
	
	var intersects = data.raycaster.intersectObjects( data.scene.children );
	if( intersects.length == 0 ) return;
	
	var node, to_edge, from_edge;
	var focusNode = data.focusNode;
	for( var key in intersects ) {
		var obj = intersects[key].object;
		node = node || imaginnection.three.Node.list[obj.name];
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
	if( focusNode == node ) return;
	imaginnection.three.setFocusNode( node.name, true );
};


imaginnection.three.moveControlTarget = function( pos ) {
	var data = imaginnection.threeData;
	var view = document.getElementById('edges-index');
	data.mouse.x = ( pos.clientX / view.clientWidth ) * 2 - 1;
	data.mouse.y = - ( (pos.clientY - 50) / view.clientHeight ) * 2 + 1;

	if( data.isMouseDown && !data.isDrag ) {
		// ドラッグ判定、一定距離を離れた場合はドラッグとして扱う
		data.isDrag = Math.sqrt(Math.pow(data.mouseDownPos.x - pos.clientX, 2) + Math.pow(data.mouseDownPos.y - pos.clientY, 2)) > 5;
	}
};


imaginnection.three.resetControlTarget = function() {
	var data = imaginnection.threeData;
	data.isCameraTargeting = false;
	data.isDrag = false;
	data.isMouseDown = false;
};


imaginnection.three.setZoom = function( ratio ) {
	var data = imaginnection.threeData;
	var target_pos = new THREE.Vector3(0, 0, 0);
	if( data.focusNode ) {
		target_pos.copy( data.focusNode.particle.position );
	} else {
		target_pos = new THREE.Vector3(0, 0, 0);
	}
	data.zoomPos.copy(data.camera.position);
	data.delta.subVectors( target_pos, data.camera.position ).multiplyScalar( ratio );
	data.zoomPos.add( data.delta );
	data.isCameraZoom = true;
};


imaginnection.three.resetZoom = function() {
	imaginnection.threeData.isCameraZoom = false;
};


imaginnection.three.animate = function() {
	requestAnimationFrame( imaginnection.three.animate );
	imaginnection.threeData.controls.update();
	imaginnection.three.render();
};


imaginnection.three.render = function() {
	var data = imaginnection.threeData;
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

	var view = document.getElementById('edges-index');
	var node_list = imaginnection.three.Node.list;
	var node_label_list = imaginnection.three.NodeLabel.list;
	var view_node = [];

	data.context.clearRect(0, 0, view.clientWidth, view.clientHeight);

	for( var key in node_list ) {
		var node = node_list[key];
		node.update();
		if( node == imaginnection.threeData.focusNode ) continue;
		
		var view_pos = node.view_pos;
		if( (view_pos.z < -1) || ((view_pos.x < -1 || view_pos.x > 1) || (view_pos.y < -1 || view_pos.y > 1)) ) {
			continue;
		}
		if( view_node.length < node_label_list.length ) {
			view_node.push(node);
			continue;
		}
		for( var i = 0 ; i < view_node.length; i++ ) {
			if( view_pos.distanceTo(data.labelViewTargetPos) > view_node[i].view_pos.distanceTo(data.labelViewTargetPos) ) continue;
			view_node[i] = node;
			break;
		}
	}
	
	var count = 1;
	for( var i = 0 ; i < view_node.length; i++ ) {
		if( node_label_list[count].update(view_node[i], data.camera, view.clientWidth, view.clientHeight) ) {
			count++;
		}
		if( count >= node_label_list.length ) break;
	}

	if( imaginnection.threeData.focusNode ) {
		node_label_list[0].update(imaginnection.threeData.focusNode, data.camera, view.clientWidth, view.clientHeight);
		
		if( imaginnection.tour && imaginnection.tour.getCurrentStep() == 4 ) {
			if( window.location.hash.length <= 1 && target_pos.distanceTo(data.controls.target) < 300 ) {
				imaginnection.setTour(5);
			}
		}
	} else {
		node_label_list[0].update(null, data.camera, view.clientWidth, view.clientHeight);
	}
	
	for( ; count < node_label_list.length; count++ ) {
		node_label_list[count].update(null, data.camera, view.clientWidth, view.clientHeight);
	}
	
	var edge_list = imaginnection.three.Edge.list;
	for( var key in edge_list ) {
		edge_list[key].update();
	}
	
  //data.context.shadowColor = "#fff";
  //data.context.shadowBlur = 10;
  
	data.renderer.render( data.scene, data.camera );
  data.animeTimer = nowTime;
};

