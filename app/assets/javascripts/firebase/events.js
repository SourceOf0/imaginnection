
/* global $ */


var imaginnection = imaginnection || {};


// 表示要素切り替え
imaginnection.changeContent = function() {
  
  if( window.location.hash.length == 0 ) {
    // ポップアップ全部隠す
    $(".modal").modal("hide");
    return;
  }
  
  let hash = decodeURIComponent(window.location.hash.substring(1));
  
  if( hash === "node-new" ) {
    // フォームの中身を消す
    $("#node-new-form")[0].reset();
    $("#node-new").modal("show");
    return;
  }
  
  if( hash.startsWith("edge-new-") ) {
    // フォームの中身を消す
    $("#edge-new-form")[0].reset();
    
    // 指定されている名前を挿入
    let name = decodeURIComponent(hash.replace(/^edge-new-/, ""));
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
  imaginnection.initDB();
  if( imaginnection.three ) {
    imaginnection.initTour();
    imaginnection.three.init();
  } else {
    imaginnection.clearEdges();
  }
  imaginnection.changeContent();
  
  
  $("#tour-icon").on("click", function() {
  	imaginnection.setTour(0);
  	imaginnection.tour.restart();
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
    window.location.hash = "";
  });
  
  $("#edge-new").on("shown.bs.modal", function() {
    imaginnection.setTour(4);
    $("#edge-new .node-name").focus();
  }).on("hide.bs.modal", function() {
    window.location.hash = "";
  });

	$("#drawer .drawer-open").click(function() {
		let $div = $("#drawer .drawer-body");
		let $icon = $("#drawer .drawer-open span");
		if($div.hasClass("in")) {
			$div.removeClass("in");
			$icon.addClass("glyphicon-triangle-left");
			$icon.removeClass("glyphicon-triangle-right");
		} else {
			$div.addClass("in");
			$icon.removeClass("glyphicon-triangle-left");
			$icon.addClass("glyphicon-triangle-right");
		}
	});
	
	if( window.innerWidth > 1500 ) {
	  $("#drawer .drawer-open").click();
	}
});

// URLの#以降が変化したとき
window.onhashchange = function() {
  imaginnection.changeContent();
};
