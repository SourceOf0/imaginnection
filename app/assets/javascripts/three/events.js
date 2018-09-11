
/* global $ */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.setFocusEvent = function( event ) {
	imaginnection.three.setFocusNode($(this).find(".panel-title .name").text());
	$("#node-option li").addClass("active");
};

imaginnection.three.onClickEdgeEvent = function( event ) {
	try {
		//console.log("list: ", imaginnection.three.Node.list);
		var data = $(this).attr("href").split("/");
		var from_node = imaginnection.three.Node.list[decodeURIComponent(data[0])];
		var to_node = imaginnection.three.Node.list[decodeURIComponent(data[1])];
		var edge = from_node.getToEdge( to_node );
	  edge.onClick();
	} catch(e) {
	   console.error(e);
	}
  return false;
};
