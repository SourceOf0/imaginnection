
/* global $ */
/* global THREE */

var PI2 = Math.PI * 2;
var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.NodeLabel = {
	
	list: [],
	
	create: function() {
		let div = document.createElement('div');
		div.className = 'text-label';
		div.style.position = 'absolute';

		return {
			element: div,
			width: 300,
			height: 16,
			node: null,
			position: new THREE.Vector3(0, 0, 0),
			hide: function() {
				this.element.style.display = "none";
			},
			setTarget: function() {
				div.classList.add("target-node");
			},
			resetTarget: function() {
				div.classList.remove("target-node");
			},
			update: function( node, camera, viewWidth, viewHeight ) {
				if( node == null ) {
					this.resetTarget();
					this.hide();
					return false;
				}
	
				this.position.copy(node.particle.position);
				let vector = this.position.project(camera);
				
				let z_min = Math.min(0.001 * node.edge_count + 0.996, 1.0);
				if( imaginnection.threeData.focusNode != node ) {
					if( (vector.z > z_min) || ((vector.x < -0.5 || vector.x > 0.5) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						this.resetTarget();
						this.hide();
						return false;
					}
				} else {
					if( (vector.z < -1.0) || ((vector.x < -0.5 || vector.x > 0.5) || (vector.y < -0.9 || vector.y > 0.9)) ) {
						this.hide();
						return false;
					}
					this.setTarget();
				}
	
				this.node = node;
				if( this.element.innerHTML != node.name ) this.element.innerHTML = node.name;
	
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
	
	create: function( name, index ) {
		let pos = new THREE.Vector3( ((this.total_count % 6 / 6) * 20 + 4) * 30 + 30, 0, 0);
		pos.applyAxisAngle( this.org1, (this.total_count % 50 / 50) * PI2 );
		pos.applyAxisAngle( this.org2, (this.total_count % 7 / 7) * PI2/2 );
	
		let color = imaginnection.threeData.normalColor;
		let particle = new THREE.Sprite( new THREE.SpriteCanvasMaterial( { color: color, program: this.programStroke } ) );
		particle.position.copy(pos);
		particle.scale.x = particle.scale.y = 0;
		particle.name = name;
		
		this.total_count++;
		
		return {
			index: this.total_count,
			particle: particle,
			name: name,
			is_owner: false,
			from_edges: {},
			to_edges: {},
			edge_count: 0,
			update: function() {
				let target_scale = this.edge_count * 5 + 10;
				this.particle.scale.x += (target_scale - this.particle.scale.x) * 0.1;
				this.particle.scale.y += (target_scale - this.particle.scale.y) * 0.1;
			},
			getToEdge: function( to_node ) {
				for( let key in this.to_edges ) {
					let edge = this.to_edges[key];
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
				for( let key in this.to_edges ) {
				  this.to_edges[key].setTargetStyle();
				}
				for( let key in this.from_edges ) {
				  this.from_edges[key].setSubTargetStyle();
				}
			},
			setDefaultStyle: function() {
				this.particle.material.program = imaginnection.three.Node.programStroke;
				for( let key in this.to_edges ) {
					this.to_edges[key].setDefaultStyle();
				}
				for( let key in this.from_edges ) {
					this.from_edges[key].setDefaultStyle();
				}
			},
			setOwner: function( to_node ) {
				if( !this.is_owner ) {
					this.is_owner = true;
					let color = imaginnection.threeData.ownerColor;
					this.particle.material.color.set(color);
				}
				if( !to_node ) return;
				to_node.setOwner( null );
			},
			resetOwner: function( to_node ) {
				let owner_edge_num = 0;
				for( let key in this.from_edges ) {
					let edge = this.from_edges[key];
				  if( edge.is_owner ) {
				  	owner_edge_num++;
				  }
				}
				if( to_node ) {
					for( let key in this.to_edges ) {
						let edge = this.to_edges[key];
					  if( (edge.to_node.name != to_node.name) && edge.is_owner ) {
					  	owner_edge_num++;
					  }
					}
					to_node.resetOwner( null );
				}
				if( owner_edge_num > 0 ) return;
				this.is_owner = false;
				let color = imaginnection.threeData.normalColor;
				this.particle.material.color.set(color);
			},
		};
	}
};

imaginnection.three.Edge = {

	list: {},

	create: function( from_node, to_node ) {
		if(!from_node || !to_node) return null;
		
		let color = imaginnection.threeData.normalColor;
		let geometry = new THREE.BufferGeometry().setFromPoints( [from_node.particle.position, to_node.particle.position] );
		let line = new THREE.Line( geometry, new THREE.LineBasicMaterial( { color: color, opacity: 0.5, linewidth: 1 } ) );
		
		line.name = from_node.name + " -> " + to_node.name;

		return {
			line: line,
			is_owner: false,
			from_node: from_node,
			to_node: to_node,
			click_time: 0,
			count: 0,
			update: function() {
				if( this.click_time > 0 ) {
					let ratio = 1 - this.click_time / 20;
					line.material.linewidth = 10 * ratio;
					this.click_time--;
				}
			},
			onClick: function() {
				if( this.click_time > 0 ) return;
				imaginnection.viewUserList(this.from_node.name, this.to_node.name);
				this.click_time = 20;
				line.material.linewidth = 1;
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
				line.material.linewidth = 10;
				line.material.opacity = 1;
				this.click_time = 0;
			},
			setSubTargetStyle: function() {
				line.material.linewidth = 10;
				line.material.opacity = 0.2;
				this.click_time = 0;
			},
			setDefaultStyle: function() {
				line.material.linewidth = 1;
				line.material.opacity = 0.5;
				this.click_time = 0;
			},
			setOwner: function() {
				if( this.is_owner == true ) return;
				this.is_owner = true;
				let color = imaginnection.threeData.ownerColor;
				line.material.color.set(color);
				from_node.setOwner( to_node );
			},
			resetOwner: function() {
				if( this.is_owner == false ) return;
				this.is_owner = false;
				let color = imaginnection.threeData.normalColor;
				line.material.color.set(color);
				from_node.resetOwner( to_node );
			},
		};
	}

};
