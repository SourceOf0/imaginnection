
/* global firebase */
/* global db */
/* global accept */

var db = db || {};


/** 
 * firebase初期化
 */
if( !firebase.apps.length ) {
	var config = {
		apiKey: "AIzaSyBymtFyHXt65wtX8F2qyXox5MP7qM0aaGw",
		authDomain: "imaginnection-56d13.firebaseapp.com",
		databaseURL: "https://imaginnection-56d13.firebaseio.com",
		storageBucket: "imaginnection-56d13.appspot.com",
	};
	firebase.initializeApp(config);
}


// DB初期化
db.initDB = function() {
	
	// キャッシュデータを空にする
	db.data = {};
	
	// 各種データの取得と更新イベント監視
	
	// users
	db.data.users = {};
	accept.view_ids.forEach( function(id) {
		var usersSnapshot = firebase.database().ref("users/" + id);
		usersSnapshot.off("value", db.changeUsersDB);
		usersSnapshot.on("value", db.changeUsersDB);
	});
	
	// edges
	db.data.edges = {};
	var edgesSnapshot = firebase.database().ref("edges");
	edgesSnapshot.off("value", db.changeEdgesDB);
	edgesSnapshot.on("value", db.changeEdgesDB);
	
	accept.view_ids.forEach( function(user_id) {
		var edgeRef = firebase.database().ref("users/" + user_id + "/edges").orderByChild("created_at");
		// 追加イベント監視
		edgeRef.off("child_added", db.childAddedUsersDB);
		edgeRef.on("child_added", db.childAddedUsersDB);
		// 削除イベント監視
		edgeRef.off("child_removed", db.childRemovedUsersDB);
		edgeRef.on("child_removed", db.childRemovedUsersDB);
	});
};
