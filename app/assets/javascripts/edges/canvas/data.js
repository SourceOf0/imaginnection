
/* global THREE */
/* global accept */
/* global ajax */

var PI2 = Math.PI * 2;
var canvas = canvas || {};


canvas.NodeLabel = {
	height: 14 * window.devicePixelRatio,
	
	create: function() {
		
		return {
			position: new THREE.Vector3(0, 0, 0),
			
			update: function( node, viewWidth, viewHeight ) {
				if( node.is_hide ) return false;
				
				var data = canvas.data;
				
				var vector = node.view_pos;
				var z_min = Math.min(0.00004 * node.edge_count + 0.999, 1.0);
				if( node.is_target ) {
					if( (vector.z > 1.0) || ((vector.x < -0.9 || vector.x > 0.9) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						return false;
					}
				} else {
					if( (vector.z > z_min) || ((vector.x < -0.9 || vector.x > 0.9) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						return false;
					}
				}
				
				var text = node.name;
				var posX = (vector.x + 1)*viewWidth;
				var posY = -(vector.y - 1)*viewHeight;
				
				if( node.is_target ) {
					data.context.strokeStyle = "rgba(0, 0, 0, 0.5)";
					data.context.fillStyle = "rgba(255, 255, 255, 1)";
					
					if( !!accept.current_id && node == canvas.data.focusNode ) {
						var gaze_text = "";
						if( node.is_gaze ) {
							gaze_text = "[通知受け取り：ON]";
							data.context.fillStyle = "rgba(255, 230, 150, 1)";
						} else {
							gaze_text = "[通知受け取り：OFF]";
						}
						vector.x = (posX - data.context.measureText(gaze_text).width) / 2;
						vector.y = (posY + canvas.NodeLabel.height*4) / 2;
						data.context.strokeText(gaze_text, vector.x, vector.y);
						data.context.fillText(gaze_text, vector.x, vector.y);
					}
				} else {
					data.context.strokeStyle = "rgba(0, 0, 0, 0.1)";
					data.context.fillStyle = "rgba(255, 255, 255, 0.3)";
				}
				
				vector.x = (posX - data.context.measureText(text).width) / 2;
				vector.y = (posY + canvas.NodeLabel.height) / 2;
				data.context.strokeText(text, vector.x, vector.y);
				data.context.fillText(text, vector.x, vector.y);

				return true;
			},
		};
	},

};


canvas.Node = {
	
	total_count: 0,
	list: {},
	org1: new THREE.Vector3(0, 1, 0),
	org2: new THREE.Vector3(0, 0, 1),
	
	programFill: function( context ) {
		context.lineWidth = canvas.data.nodeLineWidth;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.fill();
	},
	
	programStroke: function( context ) {
		context.lineWidth = canvas.data.nodeLineWidth;
		context.beginPath();
		context.arc( 0, 0, 0.5, 0, PI2, true );
		context.stroke();
	},
	
	create: function( name, from_node ) {
		var useFromNodeIndex = !!from_node;
		var posIndex = (( useFromNodeIndex )? from_node.edge_count+1 : this.total_count);
		//var posIndex = this.total_count;
		var pos = new THREE.Vector3( 0, 0, 0 );
		if( useFromNodeIndex ) {
			pos.x = ((posIndex % 4 / 4)*posIndex*10 + Math.log(1 + posIndex*200)*(posIndex/2 + 50)) + this.total_count/2;
			pos.applyAxisAngle( this.org1, (posIndex % 5 / 5) * PI2 + this.total_count/2 );
			pos.applyAxisAngle( this.org2, Math.log(1 + posIndex) * PI2 );
			pos.add( from_node.particle.position );
		} else {
			pos.x = ((posIndex % 11 / 11)*posIndex*6 + Math.log(1 + posIndex*200)*(posIndex/2 + 100));
			pos.applyAxisAngle( this.org1, (posIndex % 5 / 5) * PI2 );
			pos.applyAxisAngle( this.org2, Math.log(1 + posIndex) * PI2 );
		}

		var color = canvas.data.normalColor;
		var particle = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: color, program: this.programStroke } ) );
		particle.position.copy(pos);
		particle.scale.x = particle.scale.y = 0;
		particle.name = name;
		
		this.total_count++;
		
		return {
			index: this.total_count,
			particle: particle,
			name: name,
			is_owner: false,
			is_gaze: false,
			is_target: false,
			is_hide: false,
			view_pos: new THREE.Vector3(0, 0, 0),
			from_edges: {},
			to_edges: {},
			edge_count: 0,
			label: canvas.NodeLabel.create(),
			update: function() {
				var target_scale = this.edge_count * 5 + 10;
				var z_min = Math.min(0.00004 * target_scale + 0.999, 1.0);
				this.particle.scale.x += (target_scale - this.particle.scale.x) * 0.1;
				this.particle.scale.y += (target_scale - this.particle.scale.y) * 0.1;
				this.view_pos = this.particle.position.clone().project(canvas.data.camera);
				this.is_hide = !this.is_target && ((this.view_pos.z > z_min) || ((this.view_pos.x < -1.0 || this.view_pos.x > 1.0) || (this.view_pos.y < -1.0 || this.view_pos.y > 1.0)));
				this.particle.visible = !this.is_hide;
			},
			labelUpdate: function( clientWidth, clientHeight ) {
				this.label.update( this, clientWidth, clientHeight );
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
				this.particle.material.program = canvas.Node.programFill;
				this.is_target = true;
				for( var key in this.to_edges ) {
					this.to_edges[key].setTargetStyle();
					this.to_edges[key].to_node.is_target = true;
				}
				for( var key in this.from_edges ) {
					this.from_edges[key].setSubTargetStyle();
					this.from_edges[key].from_node.is_target = true;
				}
			},
			setDefaultStyle: function() {
				this.particle.material.program = canvas.Node.programStroke;
				this.is_target = false;
				for( var key in this.to_edges ) {
					this.to_edges[key].setDefaultStyle();
					this.to_edges[key].to_node.is_target = false;
				}
				for( var key in this.from_edges ) {
					this.from_edges[key].setDefaultStyle();
					this.from_edges[key].from_node.is_target = false;
				}
			},
			setColor: function() {
				var color = canvas.data.normalColor;
				if( this.is_gaze ) {
					color = canvas.data.gazeColor;
				} else if( this.is_owner ) {
					color = canvas.data.ownerColor;
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

canvas.Edge = {

	list: {},

	create: function( from_node, to_node ) {
		if(!from_node || !to_node) return null;
		
		var color = canvas.data.normalColor;
		var geometry = new THREE.BufferGeometry().setFromPoints( [from_node.particle.position, to_node.particle.position] );
		var line = new THREE.Line( geometry, new THREE.LineDashedMaterial( { color: color, opacity: 0.1, dashSize: 40, gapSize: 3, linewidth: canvas.data.edgeDefaultLineWidth } ) );
		
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
				if( from_node.is_hide || to_node.is_hide ) {
					line.material.visible = false;
				} else {
					line.material.visible = true;
				}
				if( this.click_time > 0 ) {
					var ratio = 1 - this.click_time / 20;
					line.material.linewidth = canvas.data.edgeTargetLineWidth * ratio;
					this.click_time--;
				}
			},
			onClick: function() {
				if( this.click_time > 0 ) return;
				ajax.viewUserList(this.from_node.name, this.to_node.name);
				this.click_time = 20;
				line.material.linewidth = canvas.data.edgeDefaultLineWidth;
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
				line.material.linewidth = canvas.data.edgeTargetLineWidth;
				line.material.opacity = 1;
				this.click_time = 0;
			},
			setSubTargetStyle: function() {
				line.material.linewidth = canvas.data.edgeTargetLineWidth;
				line.material.opacity = 0.2;
				this.click_time = 0;
			},
			setDefaultStyle: function() {
				line.material.linewidth = canvas.data.edgeDefaultLineWidth;
				line.material.opacity = 0.1;
				this.click_time = 0;
			},
			setOwner: function() {
				if( this.is_owner == true ) return;
				this.is_owner = true;
				var color = canvas.data.ownerColor;
				line.material.color.set(color);
				line.material.gapSize = 0;
				from_node.setOwner( to_node );
			},
			resetOwner: function() {
				if( this.is_owner == false ) return;
				this.is_owner = false;
				var color = canvas.data.normalColor;
				line.material.color.set(color);
				line.material.gapSize = 3;
				from_node.resetOwner( to_node );
			},
		};
	}

};
