
/* global $ */
/* global firebase */


var imaginnection = imaginnection || {};


// 表示要素切り替え
imaginnection.changeContent = function() {
  
  var hash = decodeURIComponent(window.location.hash.substring(1));
  
  if( hash == 0 ) {
    // ポップアップ全部隠す
    $(".modal").modal("hide");
    return;
  }
  
  if( !imaginnection.current_id ) return;
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

    // フォームの中身を消す
    $("#edge-new-form")[0].reset();

    // 指定されている名前をフォームに挿入
    var name = decodeURIComponent(hash.replace(/^edge-new-/, ""));
    $("#from-node-label").text(name);
    $("#from_node_name").attr("value", name);

    $("#edge-new").modal("show");
    return;
  }
};


/**
 * イベントハンドラ
 */
 
$(document).ready(function() {
  
  firebase.auth().onAuthStateChanged(function(user) {
    if( user ) {
      imaginnection.initDB();
      if( imaginnection.three ) {
        imaginnection.initTour();
        imaginnection.three.init();
      } else {
        imaginnection.clearEdges();
      }
      imaginnection.changeContent();
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
      if( !imaginnection.current_id ) return;
    	if( imaginnection.tour && imaginnection.tour.getCurrentStep() == 7 ) {
    		setTimeout( function() {
    			imaginnection.setTour(8);
    		}, 500);
    	}
		}
	});
	
	if( window.innerWidth > 1500 ) {
	  $("#drawer .drawer-open").click();
	}
	
  if( !imaginnection.current_id ) return;
	// 以下ログイン時のみ
  
  $("#tour-icon").on("click", function() {
    if( imaginnection.tour ) {
    	imaginnection.setTour(0);
    	imaginnection.tour.restart();
    }
  });
  
  $("#twitter-icon").on("click", function() {
    if( !imaginnection.threeData.focusNode || ( imaginnection.current_id == imaginnection.map_user_id && !imaginnection.threeData.focusNode.is_owner ) ) {
      // 参考：http://twitter.com/share?url=[シェアするURL]&text=[ツイート内テキスト]&via=[ツイート内に含むユーザ名]&related=[ツイート後に表示されるユーザー]&hashtags=[ハッシュタグ]
      window.open().location.href = "http://twitter.com/share?url="
        + encodeURIComponent( "https://imaginnection.herokuapp.com/edges/" + imaginnection.map_user_id )
        + "&text=" + encodeURIComponent( imaginnection.map_user_name + "さんが連想した単語のマップ" )
        + "&related=imaginnection&hashtags=imaginnection";
    } else {
      window.open().location.href = "http://twitter.com/share?url="
        + encodeURIComponent( "https://imaginnection.herokuapp.com/edges/" + imaginnection.map_user_id + "#" + encodeURIComponent( imaginnection.threeData.focusNode.name ) )
        + "&text=" + encodeURIComponent( imaginnection.map_user_name + "さんが「" + imaginnection.threeData.focusNode.name + "」から連想した単語のマップ" )
        + "&related=imaginnection&hashtags=imaginnection";
    }
    return false;
  });
  
  $("#associating").on("click", function() {
    if( imaginnection.threeData.focusNode ) {
      window.location.hash = "edge-new-" + encodeURIComponent( imaginnection.threeData.focusNode.name );
    }
    return false;
  });
  
  $("#node-new").on("shown.bs.modal", function() {
    imaginnection.setTour(3);
    $("#node-new .node-name").focus();
  }).on("hide.bs.modal", function() {
    if( window.location.hash.substring(1) === "node-new") {
      window.location.hash = "";
    }
  });
  
  $("#edge-new").on("shown.bs.modal", function() {
    imaginnection.setTour(4);
    $("#edge-new .node-name").focus();
  }).on("hide.bs.modal", function() {
    if( window.location.hash.substring(1).indexOf("edge-new-") === 0 ) {
      window.location.hash = "";
    }
  });

  $("#users-modal").on("hidden.bs.modal", function() {
    if( !imaginnection.current_id ) return;
  	if( imaginnection.tour && imaginnection.tour.getCurrentStep() >= 9 ) {
			imaginnection.setTour(11);
  	}
  });
});

// URLの#以降が変化したとき
window.onhashchange = function() {
  imaginnection.changeContent();
};
