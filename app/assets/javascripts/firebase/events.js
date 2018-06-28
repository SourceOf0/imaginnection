
/* global $ */
/* global imaginnection */


// 表示要素切り替え
imaginnection.chengeContent = function() {
  // 全部一旦隠す
  $(".view").hide();
  
  if( window.location.hash.length == 0 ) {
    // デフォルト表示
    $("#edges-index").show();
    return;
  }
  
  var hash = decodeURIComponent(window.location.hash.substring(1));
  
  if( hash === "node-new" ) {
    // フォームの中身を消す
    $("#node-new-form")[0].reset();
    $("#node-new").show();
    return;
  }
  
  if( hash.startsWith("edge-new-") ) {
    // フォームの中身を消す
    $("#edge-new-form")[0].reset();
    
    // 指定されている名前を挿入
    var name = decodeURIComponent(hash.replace(/^edge-new-/, ""));
    $("#from_node_name .from-node-name").text("ノード名 : " + name);
    $("#from_node_name").attr("value", name);
    
    $("#edge-new").show();
    return;
  }
  
};


/**
 * イベントハンドラ
 */
 
$(document).ready(function() {
  imaginnection.initDB();
  imaginnection.clearEdges();
  imaginnection.initShowEdges();
  imaginnection.chengeContent();
});

// URLの#以降が変化したとき
window.onhashchange = function() {
  imaginnection.chengeContent();
};
