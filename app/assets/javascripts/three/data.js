
/* global $ */
/* global THREE */

var PI2 = Math.PI * 2;
var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


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
			position: new THREE.Vector3(0, 0, 0),
			hide: function() {
				this.resetTarget();
				this.element.style.display = "none";
			},
			setTarget: function() {
				div.classList.add("target-node");
			},
			resetTarget: function() {
				div.classList.remove("target-node");
			},
			setOwner: function() {
				div.classList.add("owner");
			},
			resetOwner: function() {
				div.classList.remove("owner");
			},
			update: function( node, camera, viewWidth, viewHeight ) {
				if( node == null ) {
					this.hide();
					return false;
				}
				
				var vector = node.view_pos;
				var z_min = Math.min(0.00001 * node.edge_count + 0.999, 1.0);
				if( imaginnection.threeData.focusNode != node ) {
					if( (vector.z > z_min) || ((vector.x < -0.9 || vector.x > 0.9) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						this.hide();
						return false;
					}
					this.resetTarget();
				} else {
					if( (vector.z < -1.0) || ((vector.x < -0.9 || vector.x > 0.9) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						this.hide();
						return false;
					}
					this.setTarget();
				}
	
				this.node = node;
				if( this.element.textContent != node.name ) this.element.textContent = node.name;
				
				if( node.is_owner ) {
					this.setOwner();
				} else {
					this.resetOwner();
				}

				vector.x = (vector.x + 1)/2 * viewWidth - this.width/2;
				vector.y = -(vector.y - 1)/2 * viewHeight - this.height/2;
	
				this.element.style.left = vector.x + 'px';
				this.element.style.top = vector.y + 'px';
				this.element.style.display = "block";
				return true;
			},
		};
	},

};


imaginnection.three.Node = {
	
	total_count: 0,
	list: {},
	org1: new THREE.Vector3(0, 1, 0),
	org2: new THREE.Vector3(0, 0, 1),
	
	programFill: function( context ) {
		context.lineWidth = imaginnection.threeData.nodeLineWidth;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.fill();
	},
	
	programStroke: function( context ) {
		context.lineWidth = imaginnection.threeData.nodeLineWidth;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.stroke();
	},
	
	create: function( name, from_node ) {
		var posIndex = ( !!from_node && from_node.edge_count > 1 )? from_node.edge_count : this.total_count;
		var pos = new THREE.Vector3( (posIndex % 4 / 4) * 500 + Math.log(1 + posIndex) * 50, 0, 0);
		pos.applyAxisAngle( this.org1, (posIndex % 11 / 11) * PI2 );
		pos.applyAxisAngle( this.org2, Math.log(1 + posIndex) * PI2 );
		if( !!from_node ) {
			pos.add( from_node.particle.position );
		}
		
		var color = imaginnection.threeData.normalColor;
		var particle = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: color, program: this.programStroke } ) );
		particle.position.copy(pos);
		particle.scale.x = particle.scale.y = 0;
		particle.name = name;
		// TODO
		var is_gaze = false;
		//if( this.total_count == 0 ) is_gaze = true;
		this.total_count++;
		
		return {
			index: this.total_count,
			particle: particle,
			name: name,
			is_owner: false,
			is_gaze: is_gaze,
			from_edges: {},
			to_edges: {},
			edge_count: 0,
			view_pos: new THREE.Vector3(0, 0, 0),
			update: function() {
				var target_scale = this.edge_count * 5 + 10;
				this.particle.scale.x += (target_scale - this.particle.scale.x) * 0.1;
				this.particle.scale.y += (target_scale - this.particle.scale.y) * 0.1;
				this.view_pos = this.particle.position.clone().project(imaginnection.threeData.camera);
			},
			getToEdge: function( to_node ) {
				for( var key in this.to_edges ) {
					var edge = this.to_edges[key];
					if( edge.to_node.name == to_node.name ) return edge;
				}
				return null;
			},
			addFromEdge: function( edge ) {
				if( !edge ) return;
				this.from_edges[edge.line.uuid] = edge;
			},
			removeFromEdge: function( edge ) {
				if( !edge ) return;
				delete this.from_edges[edge.line.uuid];
			},
			addToEdge: function( edge ) {
				if( !edge ) return;
				this.to_edges[edge.line.uuid] = edge;
			},
			removeToEdge: function( edge ) {
				if( !edge ) return;
				delete this.to_edges[edge.line.uuid];
			},
			setTargetStyle: function() {
				this.particle.material.program = imaginnection.three.Node.programFill;
				for( var key in this.to_edges ) {
					this.to_edges[key].setTargetStyle();
				}
				for( var key in this.from_edges ) {
					this.from_edges[key].setSubTargetStyle();
				}
			},
			setDefaultStyle: function() {
				this.particle.material.program = imaginnection.three.Node.programStroke;
				for( var key in this.to_edges ) {
					this.to_edges[key].setDefaultStyle();
				}
				for( var key in this.from_edges ) {
					this.from_edges[key].setDefaultStyle();
				}
			},
			setColor: function() {
				var color = imaginnection.threeData.normalColor;
				if( this.is_gaze ) {
					color = imaginnection.threeData.gazeColor;
				} else if( this.is_owner ) {
					color = imaginnection.threeData.ownerColor;
				}
				this.particle.material.color.set(color);
			},
			setGaze: function() {
				if( this.is_gaze ) return;
				this.is_gaze = true;
				this.setColor();
			},
			resetGaze: function() {
				if( !this.is_gaze ) return;
				this.is_gaze = false;
				this.setColor();
			},
			setOwner: function( to_node ) {
				if( !this.is_owner ) {
					this.is_owner = true;
					this.setColor();
				}
				if( !to_node ) return;
				to_node.setOwner( null );
			},
			resetOwner: function( to_node ) {
				var owner_edge_num = 0;
				for( var key in this.from_edges ) {
					var edge = this.from_edges[key];
					if( !edge.is_owner ) continue;
					if( !!to_node && (edge.to_node.name == to_node.name) ) continue;
					// 今から削除されるノード以外にこのノードから伸びている所有エッジがある
					owner_edge_num++;
				}
				for( var key in this.to_edges ) {
					var edge = this.to_edges[key];
					if( !edge.is_owner ) continue;
					// このノードに向かっている所有エッジがある
					owner_edge_num++;
				}
				if( owner_edge_num == 0 ) {
					// 所有エッジなし
					this.is_owner = false;
					this.setColor();
				}
				if( !!to_node ) {
					to_node.resetOwner( null );
				}
			},
		};
	}
};

imaginnection.three.Edge = {

	list: {},

	create: function( from_node, to_node ) {
		if(!from_node || !to_node) return null;
		
		var color = imaginnection.threeData.normalColor;
		var geometry = new THREE.BufferGeometry().setFromPoints( [from_node.particle.position, to_node.particle.position] );
		var line = new THREE.Line( geometry, new THREE.LineDashedMaterial( { color: color, opacity: 0.5, dashSize: 40, gapSize: 3, linewidth: imaginnection.threeData.edgeDefaultLineWidth } ) );
		
		line.name = from_node.name + " -> " + to_node.name;
		line.material.linecap = "butt";

		return {
			line: line,
			is_owner: false,
			from_node: from_node,
			to_node: to_node,
			click_time: 0,
			count: 0,
			update: function() {
				if( this.click_time > 0 ) {
					var ratio = 1 - this.click_time / 20;
					line.material.linewidth = imaginnection.threeData.edgeTargetLineWidth * ratio;
					this.click_time--;
				}
			},
			onClick: function() {
				if( this.click_time > 0 ) return;
				imaginnection.viewUserList(this.from_node.name, this.to_node.name);
				this.click_time = 20;
				line.material.linewidth = imaginnection.threeData.edgeDefaultLineWidth;
			},
			addCount: function() {
				this.count++;
				this.from_node.edge_count++;
				this.to_node.edge_count++;
			},
			decCount: function() {
				this.count--;
				this.from_node.edge_count--;
				this.to_node.edge_count--;
			},
			setTargetStyle: function() {
				line.material.linewidth = imaginnection.threeData.edgeTargetLineWidth;
				line.material.opacity = 1;
				this.click_time = 0;
			},
			setSubTargetStyle: function() {
				line.material.linewidth = imaginnection.threeData.edgeTargetLineWidth;
				line.material.opacity = 0.2;
				this.click_time = 0;
			},
			setDefaultStyle: function() {
				line.material.linewidth = imaginnection.threeData.edgeDefaultLineWidth;
				line.material.opacity = 0.5;
				this.click_time = 0;
			},
			setOwner: function() {
				if( this.is_owner == true ) return;
				this.is_owner = true;
				var color = imaginnection.threeData.ownerColor;
				line.material.color.set(color);
				line.material.gapSize = 0;
				from_node.setOwner( to_node );
			},
			resetOwner: function() {
				if( this.is_owner == false ) return;
				this.is_owner = false;
				var color = imaginnection.threeData.normalColor;
				line.material.color.set(color);
				line.material.gapSize = 3;
				from_node.resetOwner( to_node );
			},
		};
	}

};
