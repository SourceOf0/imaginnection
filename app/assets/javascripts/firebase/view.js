
/* global $ */
/* global firebase */

var imaginnection = imaginnection || {};


/** 
 * edge関連
 */

// 共感者一覧表示
imaginnection.viewUserList = function(from_node_name, to_node_name) {
  var users = imaginnection.dbdata.edges[from_node_name][to_node_name]["users"];
  var post_data = [];
  var count = 0;
  for( var key in users ) {
    count++;
    if( !users[key].is_hide_user ) post_data.push(key);
  }
  $.ajax({
    url: "/edges/users",
    type: "GET",
    data: {from_node: from_node_name, to_node: to_node_name,content: post_data, count: count},
    datatype: "html",
  });
}

// 追加表示
imaginnection.addEdgeList = function(user_id, from_node_name, to_node_name) {
  
  if( imaginnection.three ) {
    imaginnection.three.addEdge(user_id, from_node_name, to_node_name);
    return;
  }
  
  var $div = $("#edges-index .edge-temp .table").clone();
  $div.find(".from-node-name").text(from_node_name);
  $div.find(".to-node-name a").attr("href", encodeURIComponent(from_node_name) + "/" + encodeURIComponent(to_node_name)).text(to_node_name);
  //$div.attr("id", "edge-id-" + edge_id);
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
  
  $div.appendTo("#edges-index .edge-list");
};

// 表示削除
imaginnection.clearEdges = function() {
  $(".edge-list").empty();
};

// 表示初期化
imaginnection.initShowEdges = function() {
  imaginnection.clearEdges();
  
  // 追加イベント監視
  imaginnection.view_ids.forEach( function(user_id) {
    var edgeRef = firebase.database().ref("users/" + user_id + "/edges");
    edgeRef.off("child_added");
    edgeRef.on("child_added", function(childSnapshot, prevChildKey) {
      var edge = childSnapshot.val();
      imaginnection.addEdgeList(user_id, edge.from_node, edge.to_node);
    });
  });
};

