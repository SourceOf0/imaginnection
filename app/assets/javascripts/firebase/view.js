
/* global $ */
/* global firebase */

var imaginnection = imaginnection || {};


/** 
 * edge関連
 */

// 共感者一覧表示
imaginnection.viewUserList = function( from_node_name, to_node_name ) {
  var users = imaginnection.dbdata.edges[from_node_name][to_node_name]["users"];
  var post_data = [];
  var count = 0;
  var is_hide_user = true;
  for( var key in users ) {
    count++;
    if( key == imaginnection.current_id ) is_hide_user = users[key].is_hide_user;
    if( !users[key].is_hide_user ) post_data.push(key);
  }
  $.ajax({
    url: "/edges/users",
    type: "GET",
    data: {from_node: from_node_name, to_node: to_node_name, is_hide_user: is_hide_user, content: post_data, count: count},
    datatype: "html",
  });
	if( imaginnection.tour && imaginnection.tour.getCurrentStep() == 8 ) {
		setTimeout( function() {
			imaginnection.setTour(9);
		}, 500);
	}
};


// 追加表示
imaginnection.addEdgeList = function( edge_id, user_id, from_node_name, to_node_name ) {
  
  var $div = $("#debug-edges-index .edge-temp .table").clone();
  $div.find(".from-node-name").text(from_node_name);
  $div.find(".to-node-name a").attr("href", encodeURIComponent(from_node_name) + "/" + encodeURIComponent(to_node_name)).text(to_node_name);
  $div.attr("id", "edge-" + edge_id);
  if(user_id === imaginnection.current_id) {
    $div.addClass("edge-owner");
  }
  
  $div.find("a").click(function() {
    var data = $(this).attr("href").split("/");
    var from_node_name = decodeURIComponent(data[0]);
    var to_node_name = decodeURIComponent(data[1]);
    imaginnection.viewUserList(from_node_name, to_node_name);
    return false;
  });
  
  $div.appendTo("#debug-edges-index .edge-list");
};

// 表示削除
imaginnection.removeEdgeList = function( edge_id, user_id, from_node_name, to_node_name ) {
  $("#edge-" + edge_id).remove();
};


// 全表示削除
imaginnection.clearEdges = function() {
  $("#debug-edges-index .edge-list").empty();
};
