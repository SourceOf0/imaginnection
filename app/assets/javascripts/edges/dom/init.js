
/* global $ */
/* global firebase */

/* global db */
/* global accept */
/* global canvas */
/* global ajax */
/* global guide */

var dom = dom || {};


/**
 * エラー表示
 */
dom.setErrorStr = function( message ) {
	$("main").prepend(
		"<div class='alert alert-danger'>" + 
    "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>" +
		message +
		"</div>"
	);
};
dom.setError = function( error ) {
	console.log(error);
	dom.setErrorStr( error.message );
};

/**
 * 表示要素切り替え
 */
dom.changeContent = function() {
	var hash = decodeURIComponent(window.location.hash.substring(1));

	if( hash == 0 ) {
		dom.hideAllModal();
		return;
	}
	
	if( !accept.current_id ) return;
	// 以下ログイン時のみ
	
	if( hash === "node-new" ) {
		dom.showNewNodeModal();
		return;
	}
	
	if( hash.indexOf("edge-new-") === 0 ) {
		dom.showNewEdgeModal( hash.replace(/^edge-new-/, "") );
		return;
	}
	
	if( hash.indexOf("edge-show-") === 0 ) {
		ajax.viewUserList(this.from_node.name, this.to_node.name);
		return;
	}
	
	dom.showUserModalFromHash();
};


/**
 * 全体初期化
 */
$(document).ready(function() {
	
	firebase.auth().onAuthStateChanged(function(user) {
		if ( !!user && !accept.current_id ) {
			// ログアウト済み
      firebase.auth().signOut().catch(function(error) {
        console.error("ログアウトエラー", error);
      });
			return;
		} else if( !!accept.current_id && ( !user || user.uid != accept.current_id ) ) {
			// 未ログイン or id違いのためログインしなおし
			firebase.auth().signInWithCustomToken(accept.token).catch(function(error) {
				console.error("ログインエラー", error);
			});
			return;
    }
		
		db.initDB();
		guide.initTour();
		canvas.init();
		dom.changeContent();
	});
	
	dom.initDrawer();
	guide.initNavText();
	
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
	
	dom.initModal();
});


/**
 * URLの#以降が変化したとき
 */
window.onhashchange = function() {
	dom.changeContent();
};
