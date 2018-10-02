
/* global $ */
/* global firebase */
/* global accept */
/* global canvas */
/* global guide */

var db = db || {};


// 表示要素切り替え
db.changeContent = function() {
  
  var hash = decodeURIComponent(window.location.hash.substring(1));
  
  if( hash == 0 ) {
    // ポップアップ全部隠す
    $(".modal").modal("hide");
    return;
  }
  
  if( !accept.current_id ) return;
  // 以下ログイン時のみ
  
  if( hash === "node-new" ) {
    $("#edge-new").modal("hide");
    
    // フォームの中身を消す
    $("#node-new-form")[0].reset();
    
    $("#node-new").modal("show");
    return;
  }
  
  if( hash.indexOf("edge-new-") === 0 ) {
    $("#node-new").modal("hide");
    
    var $edgeNew = $("#edge-new");

    // フォームの中身を消す
    $edgeNew.find("form")[0].reset();

    // 指定されている名前をフォームに挿入
    var name = hash.replace(/^edge-new-/, "");
    $edgeNew.find(".node-label").text(name);
    $edgeNew.find(".auto-node-name").attr("value", name);

    $edgeNew.modal("show");
    return;
  }
};


/**
 * イベントハンドラ
 */
 
$(document).ready(function() {
  
  firebase.auth().onAuthStateChanged(function(user) {
    if( user ) {
      db.initDB();
      guide.initTour();
      canvas.init();
      db.changeContent();
    } else {
      firebase.auth().signInAnonymously().catch(function(error) {
        console.error("ログインエラー", error);
      });
    }
  });
  
  $("#drawer .drawer-open").click(function() {
    var $div = $("#drawer .drawer-body");
    var $icon = $("#drawer .drawer-open span");
    if($div.hasClass("in")) {
      $div.removeClass("in");
      $icon.addClass("glyphicon-triangle-left");
      $icon.removeClass("glyphicon-triangle-right");
    } else {
      $div.addClass("in");
      $icon.removeClass("glyphicon-triangle-left");
      $icon.addClass("glyphicon-triangle-right");
      if( !accept.current_id ) return;
      guide.setTour(8, [7]);
    }
  });
  
  if( window.innerWidth > 1500 ) {
    $("#drawer .drawer-open").click();
  }
  
  if( !accept.current_id ) return;
  // 以下ログイン時のみ
  
  $("#tour-icon").on("click", function() {
    guide.setTourRestart();
  });
  
  $("#twitter-icon").on("click", function() {
    if( !canvas.data.focusNode || ( accept.current_id == accept.map_user_id && !canvas.data.focusNode.is_owner ) ) {
      // 参考：http://twitter.com/share?url=[シェアするURL]&text=[ツイート内テキスト]&via=[ツイート内に含むユーザ名]&related=[ツイート後に表示されるユーザー]&hashtags=[ハッシュタグ]
      window.open().location.href = "http://twitter.com/share?url="
        + encodeURIComponent( "https://www.imaginnection.net/edges/" + accept.map_user_id )
        + "&text=" + encodeURIComponent( accept.map_user_name + "さんが連想した単語のマップ" )
        + "&related=imaginnection&hashtags=imaginnection";
    } else {
      window.open().location.href = "http://twitter.com/share?url="
        + encodeURIComponent( "https://www.imaginnection.net/edges/" + accept.map_user_id + "#" + encodeURIComponent( canvas.data.focusNode.name ) )
        + "&text=" + encodeURIComponent( accept.map_user_name + "さんが「" + canvas.data.focusNode.name + "」から連想した単語のマップ" )
        + "&related=imaginnection&hashtags=imaginnection";
    }
    return false;
  });
  
  $("#associating").on("click", function() {
    if( canvas.data.focusNode ) {
      window.location.hash = "edge-new-" + encodeURIComponent( canvas.data.focusNode.name );
    }
    return false;
  });
  
  $("#node-new").on("shown.bs.modal", function() {
    guide.setTour(3);
    $("#node-new .node-name").focus();
  }).on("hide.bs.modal", function() {
    $("#node-new .node-name").blur();
    if( window.location.hash.substring(1) === "node-new") {
      guide.setTour(2, [4, 3]);
      window.location.hash = "";
    }
  });
  
  $("#edge-new").on("shown.bs.modal", function() {
    guide.setTour(4);
    $("#edge-new .node-name").focus();
  }).on("hide.bs.modal", function() {
    $("#edge-new .node-name").blur();
    if( window.location.hash.substring(1).indexOf("edge-new-") === 0 ) {
      guide.setTour(2, [4, 3]);
      window.location.hash = "";
    }
  });

  $("#users-modal").on("hidden.bs.modal", function() {
    if( !accept.current_id ) return;
    guide.setTour(11, [9, 10]);
  });
});

// URLの#以降が変化したとき
window.onhashchange = function() {
  db.changeContent();
};
