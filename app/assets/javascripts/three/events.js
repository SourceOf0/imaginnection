
/* global $ */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.setFocusEvent = function( event ) {
	imaginnection.three.setFocusNode($(this).find(".panel-title .name").text());
	$("#node-option li").show();
};

imaginnection.three.onClickEdgeEvent = function( event ) {
  var data = $(this).attr("href").split("/");
	var from_node = imaginnection.three.Node.list[decodeURIComponent(data[0])];
	var to_node = imaginnection.three.Node.list[decodeURIComponent(data[1])];
	var edge = from_node.getToEdge( to_node );
  edge.onClick();
  return false;
};
