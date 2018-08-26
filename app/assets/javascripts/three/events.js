
/* global $ */

var imaginnection = imaginnection || {};
imaginnection.three = imaginnection.three || {};


imaginnection.three.setFocusEvent = function( event ) {
	imaginnection.three.setFocusNode($(this).find(".panel-title .name").text());
	$("#associating").show();
};

imaginnection.three.onClickEdgeEvent = function( event ) {
  let data = $(this).attr("href").split("/");
	let from_node = imaginnection.three.Node.list[decodeURIComponent(data[0])];
	let to_node = imaginnection.three.Node.list[decodeURIComponent(data[1])];
	let edge = from_node.getToEdge( to_node );
  edge.onClick();
  return false;
};
