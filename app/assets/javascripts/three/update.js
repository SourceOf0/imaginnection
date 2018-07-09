
/* global $ */
/* global THREE */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.setFocusNode = function( node_name, isScroll ) {
	let data = imaginnection.threeData;
	let from_node = imaginnection.three.Node.list[node_name];
	if( !from_node ) return;
	if( data.focusNode ) {
		data.focusNode.setDefaultStyle();
	}
	data.focusNode = from_node;
	data.focusNode.setTargetStyle();
	data.is_camera_targeting = true;
	let vector = data.focusNode.particle.position.clone().project(data.camera);
	if( vector.z > 1 ) {
		data.zoom_pos.subVectors( data.focusNode.particle.position, data.camera.position );
		data.zoom_pos = data.zoom_pos.normalize().negate().multiplyScalar(500).add(data.focusNode.particle.position);
		data.is_camera_zoom = true;
	}
	
	if( imaginnection.tour.getCurrentStep() == 4 ) {
		setTimeout( function() {
			imaginnection.setTour(5);
		}, 500);
	}
	
	if( !isScroll ) return;
	
	let $box = $("#drawer .drawer-body");
	let $target = $("#from-node-index-" + from_node.index);
	let $list = $("#nodes-index");
	let index = $list.children().index($target);
	let pos = $box.scrollTop() + ($list.offset().top + $target.outerHeight(true) * index) - $box.offset().top - 10;

	$("#from-node-index-" + from_node.index + ">a").click();
	$box.stop().animate({ scrollTop: pos }, 500, "swing");
};


imaginnection.three.addNode = function( name, edge_count ) {
	let node = imaginnection.three.Node.create( name, edge_count );
	imaginnection.threeData.scene.add(node.particle);
	imaginnection.three.Node.list[name] = node;
	
	let index = node.index;
	let $container = $("#nodes-index");
	let temp = "";
	temp += "<div id='from-node-index-" + index + "' class='panel panel-default'>";
	temp += "<a class='btn btn-default btn-block panel-heading' role='button' data-toggle='collapse' data-parent='#nodes-index' href='#from-node-list-" + index + "' aria-expanded='false' aria-controls='from-node-list-" + index + "'>";
	temp += "<h4 class='panel-title'>";
	temp += "<span class='name'>" + name + "</span>";
	temp += "<span class='badge pull-right'>0</span>";
	temp += "</h4>";
	temp += "</a>";
	temp += "<div id='from-node-list-" + index + "' class='panel-collapse collapse' role='tabpanel' aria-labelledby='from-node-index-" + index + "'>";
	temp += "<div class='list-group'>";
	temp += "</div>";
	temp += "</div>";
	temp += "</div>";
	$container.append(temp);
	
	$container.find("#from-node-index-" + index).click( imaginnection.three.setFocusEvent );

	return node;
};


imaginnection.three.addEdgeList = function( edge ) {
	let from_node = edge.from_node;
	let to_node = edge.to_node;
	let $container = $( "#from-node-index-" + from_node.index );
	let $to_node_num = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index + " .badge" );
	
	let sum = 0;
	for( let key in from_node.to_edges ) {
		sum += from_node.to_edges[key].count;
	}
	
	$container.find(".panel-title .badge").text(sum);

	if( $to_node_num.length > 0 ) {
		$to_node_num.text(edge.count);
	} else {
		let temp = "";
		temp += "<a id='to-node-index-" + from_node.index + "-" + to_node.index + "' class='list-group-item' href='" + encodeURIComponent(from_node.name) + "/" + encodeURIComponent(to_node.name) +"'>";
		temp += "<span class='name'>" + to_node.name + "</span>";
		temp += "<span class='badge pull-right'>" + edge.count + "</span>";
		temp += "</a>";
		$container.find(".list-group").append(temp);
		
		$container.find( "#to-node-index-" + from_node.index + "-" + to_node.index ).click( imaginnection.three.onClickEdgeEvent );
	}
};


imaginnection.three.addEdge = function( user_id, from_node_name, to_node_name ) {
	let data = imaginnection.threeData;
	let from_node = imaginnection.three.Node.list[from_node_name];
	let to_node = imaginnection.three.Node.list[to_node_name];
	let is_owner = ( user_id === imaginnection.current_id );

	if( !from_node ) {
		from_node = imaginnection.three.addNode(from_node_name, 0);
	}
	if( !to_node ) {
		to_node = imaginnection.three.addNode(to_node_name, from_node.edge_count);
	}
	
	let edge = from_node.getToEdge( to_node );
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
	imaginnection.three.addEdgeList( edge );
};


imaginnection.three.setControlTarget = function() {
	let data = imaginnection.threeData;
	data.is_mouse_down = false;
	if ( data.is_drag ) {
		data.is_drag = false;
		return;
	}
	data.raycaster.setFromCamera( data.mouse, data.camera );
	
	let intersects = data.raycaster.intersectObjects( data.scene.children );
	if( intersects.length == 0 ) return;
	
	let node, to_edge, from_edge;
	let focusNode = data.focusNode;
	for( let key in intersects ) {
		let obj = intersects[key].object;
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
	let data = imaginnection.threeData;
	let view = document.getElementById('edges-index');
	data.mouse.x = ( pos.clientX / view.clientWidth ) * 2 - 1;
	data.mouse.y = - ( (pos.clientY - 50) / view.clientHeight ) * 2 + 1;

	if( data.is_mouse_down && !data.is_drag ) {
		// ドラッグ判定、一定距離を離れた場合はドラッグとして扱う
		data.is_drag = Math.sqrt(Math.pow(data.mouse_down_pos.x - pos.clientX, 2) + Math.pow(data.mouse_down_pos.y - pos.clientY, 2)) > 5;
	}
};


imaginnection.three.resetControlTarget = function() {
	let data = imaginnection.threeData;
	data.is_camera_targeting = false;
	data.is_drag = false;
	data.is_mouse_down = false;
};


imaginnection.three.setZoom = function( ratio ) {
	let data = imaginnection.threeData;
	let target_pos = new THREE.Vector3(0, 0, 0);
	if( data.focusNode ) {
		target_pos.copy( data.focusNode.particle.position );
	} else {
		target_pos = new THREE.Vector3(0, 0, 0);
	}
	data.zoom_pos.copy(data.camera.position);
	data.delta.subVectors( target_pos, data.camera.position ).multiplyScalar( ratio );
	data.zoom_pos.add( data.delta );
	data.is_camera_zoom = true;
};


imaginnection.three.resetZoom = function() {
	imaginnection.threeData.is_camera_zoom = false;
};


imaginnection.three.animate = function() {
	requestAnimationFrame( imaginnection.three.animate );
	imaginnection.threeData.controls.update();
	imaginnection.three.render();
};


imaginnection.three.render = function() {
	let data = imaginnection.threeData;
	if( data.is_camera_targeting && data.focusNode ) {
		let target_pos = data.focusNode.particle.position;
		data.delta.subVectors( target_pos, data.controls.target ).multiplyScalar( 0.05 );
		data.controls.target.add( data.delta );
		if( target_pos.distanceTo(data.controls.target) < 1 ) {
			data.controls.target.copy(target_pos);
			data.is_camera_targeting = false;
		}
	}
	
	if( data.is_camera_zoom ) {
		data.delta.subVectors( data.zoom_pos, data.camera.position ).multiplyScalar( 0.2 );
		data.camera.position.add( data.delta );
		if( data.zoom_pos.distanceTo(data.camera.position) < 5 ) {
			data.is_camera_zoom = false;
		}
	}

	let count = 1;
	let view = document.getElementById('edges-index');
	let node_list = imaginnection.three.Node.list;
	let node_label_list = imaginnection.three.NodeLabel.list;
	for( let key in node_list ) {
		let node = node_list[key];
		node.update();
		if( count >= node_label_list.length ) continue;
		let node_label = node_label_list[count];
		if( node == imaginnection.threeData.focusNode ) {
			node_label_list[0].update(node, data.camera, view.clientWidth, view.clientHeight);
		} else if( node_label.update(node, data.camera, view.clientWidth, view.clientHeight) ) {
			count++;
		}
	}
	for( ; count < node_label_list.length; count++ ) {
		node_label_list[count].update(null, data.camera, view.clientWidth, view.clientHeight);
	}
	
	let edge_list = imaginnection.three.Edge.list;
	for( let key in edge_list ) {
		edge_list[key].update();
	}
	
	data.renderer.render( data.scene, data.camera );
};

