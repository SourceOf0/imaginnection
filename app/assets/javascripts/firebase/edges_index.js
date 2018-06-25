
/* global $ */
/* global firebase */

/* global current_id */
/* global view_ids */

var imaginnection = imaginnection || {};

/** 
 * edge関連
 */

// 追加表示
imaginnection.addEdgeList = function(edge_id, edge) {
  
  // 表示済みなら何もしない
  if( $("#edge-id-" + edge_id).length > 0 ) return;
  
  var $div = $(".edge-temp .table").clone();
  $div.find(".from-node-name").text(edge.from_node);
  $div.find(".to-node-name a").attr("href", edge_id).text(edge.to_node);
  $div.attr("id", "edge-id-" + edge_id);
  if(edge.users[current_id]) {
    $div.addClass("edge-owner");
  }
  
  $div.find("a").click(function() {
    var edge_id = $(this).attr("href");
    var edge = imaginnection.dbdata.edges[edge_id];
    $.ajax({
      url: "edges/" + edge_id,
      type: "GET",
      data: {content : edge.users},
      datatype: "html",
    });
    return false;
  });
  
  $div.appendTo(".edge-list");
};

// 表示削除
imaginnection.clearEdges = function() {
  $(".edge-list").empty();
};

// 表示初期化
imaginnection.initShowEdges = function() {
  imaginnection.clearEdges();
  
  // 追加イベント監視
  view_ids.forEach( function(id) {
    var edgeRef = firebase.database().ref("users/" + id);
    edgeRef.off("child_added");
    edgeRef.on("child_added", function(childSnapshot, prevChildKey) {
      var edge_id = childSnapshot.key;
      firebase.database().ref("edges/" + edge_id).once("value", function(edgeSnapshot) {
        imaginnection.addEdgeList(edge_id, edgeSnapshot.val());
      });
    });
  });
};

$(document).ready(function() {
  imaginnection.initDB();
  imaginnection.clearEdges();
  imaginnection.initShowEdges();
});
