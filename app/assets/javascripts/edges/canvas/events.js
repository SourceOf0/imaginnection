
/* global $ */

var canvas = canvas || {};


canvas.setFocusEvent = function( event ) {
	canvas.setFocusNode( $(this).find(".panel-title .name").text(), false );
};

canvas.onClickEdgeEvent = function( event ) {
	try {
		//console.log("list: ", canvas.Node.list);
		var data = $(this).attr("href").split("/");
		var from_node = canvas.Node.list[decodeURIComponent(data[0])];
		var to_node = canvas.Node.list[decodeURIComponent(data[1])];
		var edge = from_node.getToEdge( to_node );
		edge.onClick();
	} catch(e) {
		console.error(e);
	}
	return false;
};
