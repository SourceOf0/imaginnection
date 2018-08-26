
/* global $ */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.addNodeList = function( node ) {
	let index = node.index;
	let $container = $("#nodes-index");
	let temp = "";
	temp += "<div id='from-node-index-" + index + "' class='panel panel-primary" + ((node.is_gaze)? ' gaze':'') + "'>";
	temp += "<a class='btn btn-primary btn-block panel-heading' role='button' data-toggle='collapse' data-parent='#nodes-index' href='#from-node-list-" + index + "' aria-expanded='false' aria-controls='from-node-list-" + index + "'>";
	temp += "<h4 class='panel-title'>";
	temp += "<span class='name'>" + node.name + "</span>";
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
};

imaginnection.three.removeNodeList = function( node ) {
	$( "#from-node-index-" + node.index ).remove();
};

imaginnection.three.addEdgeList = function( is_owner, edge ) {
	let from_node = edge.from_node;
	let to_node = edge.to_node;
	let $container = $( "#from-node-index-" + from_node.index );
	let $to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );
	
	let sum = 0;
	for( let key in from_node.to_edges ) {
		sum += from_node.to_edges[key].count;
	}
	
	$container.find(".panel-title .badge").text(sum);

	if( $to_node.find(".badge").length > 0 ) {
		$to_node.find(".badge").text(edge.count);
	} else {
		let temp = "";
		temp += "<a id='to-node-index-" + from_node.index + "-" + to_node.index + "' class='list-group-item' href='" + encodeURIComponent(from_node.name) + "/" + encodeURIComponent(to_node.name) +"'>";
		temp += "<span class='name'>" + to_node.name + "</span>";
		temp += "<span class='badge pull-right'>" + edge.count + "</span>";
		temp += "</a>";
		$container.find(".list-group").append(temp);
		
		$to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );
		$to_node.click( imaginnection.three.onClickEdgeEvent );
	}
};

imaginnection.three.removeEdgeList = function( is_owner, edge ) {
	let from_node = edge.from_node;
	let to_node = edge.to_node;
	let $container = $( "#from-node-index-" + from_node.index );
	let $to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );

	if( edge.count > 0 && ($to_node.find(".badge").length > 0) ) {
		$to_node.find(".badge").text(edge.count);
	} else {
		$to_node.remove();
	}
};
