
/* global $ */
/* global firebase */

var imaginnection = imaginnection || {};


/** 
 * edge関連
 */

// 共感者一覧表示
imaginnection.viewUserList = function(from_node_name, to_node_name) {
  let users = imaginnection.dbdata.edges[from_node_name][to_node_name]["users"];
  let post_data = [];
  let count = 0;
  for( let key in users ) {
    count++;
    if( !users[key].is_hide_user ) post_data.push(key);
  }
  $.ajax({
    url: "/edges/users",
    type: "GET",
    data: {from_node: from_node_name, to_node: to_node_name,content: post_data, count: count},
    datatype: "html",
  });
};


// 追加表示
imaginnection.addEdgeList = function(user_id, from_node_name, to_node_name) {
  
  let $div = $("#debug-edges-index .edge-temp .table").clone();
  $div.find(".from-node-name").text(from_node_name);
  $div.find(".to-node-name a").attr("href", encodeURIComponent(from_node_name) + "/" + encodeURIComponent(to_node_name)).text(to_node_name);
  if(user_id === imaginnection.current_id) {
    $div.addClass("edge-owner");
  }
  
  $div.find("a").click(function() {
    let data = $(this).attr("href").split("/");
    let from_node_name = decodeURIComponent(data[0]);
    let to_node_name = decodeURIComponent(data[1]);
    imaginnection.viewUserList(from_node_name, to_node_name);
    return false;
  });
  
  $div.appendTo("#debug-edges-index .edge-list");
};


// 表示削除
imaginnection.clearEdges = function() {
  $("#debug-edges-index .edge-list").empty();
};
