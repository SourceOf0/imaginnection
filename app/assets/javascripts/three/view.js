
/* global $ */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.addNodeList = function( node ) {
	var index = node.index;
	var $container = $("#nodes-index");
	var temp = "";
	temp += "<div id='from-node-index-" + index + "' class='panel panel-primary" + ((node.is_gaze)? ' gaze':'') + "'>";
	temp += "<a class='btn btn-primary btn-block panel-heading' role='button' data-toggle='collapse' data-parent='#nodes-index' href='#from-node-list-" + index + "' aria-expanded='false' aria-controls='from-node-list-" + index + "'>";
	temp += "<h4 class='panel-title'>";
	temp += "<span class='name'></span>";
	temp += "<span class='badge pull-right'>0</span>";
	temp += "</h4>";
	temp += "</a>";
	temp += "<div id='from-node-list-" + index + "' class='panel-collapse collapse' role='tabpanel' aria-labelledby='from-node-index-" + index + "' data-parent='#nodes-index'>";
	temp += "<div class='list-group'>";
	temp += "</div>";
	temp += "</div>";
	temp += "</div>";
	$container.append(temp).find("#from-node-index-" + index + " .name").text(node.name);
	
	$container.find("#from-node-index-" + index).click( imaginnection.three.setFocusEvent );
};

imaginnection.three.removeNodeList = function( node ) {
	$( "#from-node-index-" + node.index ).remove();
};

imaginnection.three.addEdgeList = function( is_owner, edge ) {
	var from_node = edge.from_node;
	var to_node = edge.to_node;
	var $container = $( "#from-node-index-" + from_node.index );
	var $to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );
	
	var sum = 0;
	for( var key in from_node.to_edges ) {
		sum += from_node.to_edges[key].count;
	}
	$container.find(".panel-title .badge").text(sum);

	if( $to_node.find(".badge").length > 0 ) {
		$to_node.find(".badge").text(edge.count);
	} else {
		var temp = "";
		temp += "<a id='to-node-index-" + from_node.index + "-" + to_node.index + "' class='list-group-item'>";
		temp += "<span class='name'></span>";
		temp += "<span class='badge pull-right'>" + edge.count + "</span>";
		temp += "</a>";
		$container.find(".list-group").append(temp)
			.find("#to-node-index-" + from_node.index + "-" + to_node.index).attr("href", encodeURIComponent(from_node.name) + "/" + encodeURIComponent(to_node.name))
			.find(".name").text(to_node.name);
		
		$to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );
		$to_node.click( imaginnection.three.onClickEdgeEvent );
	}
};

imaginnection.three.removeEdgeList = function( is_owner, edge ) {
	var from_node = edge.from_node;
	var to_node = edge.to_node;
	var $container = $( "#from-node-index-" + from_node.index );
	var $to_node = $container.find( "#to-node-index-" + from_node.index + "-" + to_node.index );

	var sum = 0;
	for( var key in from_node.to_edges ) {
		sum += from_node.to_edges[key].count;
	}
	$container.find(".panel-title .badge").text(sum);

	if( edge.count > 0 && ($to_node.find(".badge").length > 0) ) {
		$to_node.find(".badge").text(edge.count);
	} else {
		$to_node.remove();
	}
};
