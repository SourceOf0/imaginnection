
/* global $ */

/* global accept */
/* global guide */

var dom = dom || {};


/**
 * 全モーダル非表示
 */
dom.hideAllModal = function() {
	$(".modal").modal("hide");
};

/**
 * ノード作成フォーム表示
 */
dom.showNewNodeModal = function() {
	$("#edge-new").modal("hide");
	
	// フォームの中身を消す
	$("#node-new-form")[0].reset();
	
	$("#node-new").modal("show");
};

/**
 * エッジ作成フォーム表示
 */
dom.showNewEdgeModal = function( name ) {
	$("#node-new").modal("hide");
	
	var $edgeNew = $("#edge-new");

	// フォームの中身を消す
	$edgeNew.find("form")[0].reset();

	// 指定されている名前をフォームに挿入
	$edgeNew.find(".node-label").text(name);
	$edgeNew.find(".auto-node-name").attr("value", name);
	
	// タブ表示を戻しておく
	$edgeNew.find(".edge-order:first a").click();
	$edgeNew.find(".tab-pane").removeClass("active");
	$edgeNew.find(".tab-pane:first").addClass("active");

	$edgeNew.modal("show");
};


/**
 * モーダル初期化
 */
dom.initModal = function() {
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
};