
/* global $ */
/* global firebase */
/* global canvas */
/* global guide */
/* global dom */

var accept = $("#json-data").data("json");
$("#json-data").remove();

var db = db || {};


// Firebaseのパス名に使用不可な文字列を変換
db.convertPathEntities = function( text, proc ) {
	var entities = [
		["\.", "prd"],
		["\#", "shp"],
		["\$", "dlr"],
		["\/", "srs"],
		["\[", "brks"],
		["\]", "brke"],
	];
	
	for( var i = 0, max = entities.length; i < max; i++ ) {
		if( "encode" === proc ) {
			text = text.replace(new RegExp( "\\" + entities[i][0], "g" ), "&"+entities[i][1]+";" ).replace( '"', "&quot;" );
		} else {
			text = text.replace( "&quot;", '"' ).replace(new RegExp( "&"+entities[i][1]+";", "g" ), entities[i][0] );
		}
	}
	return text;
};

db.createEdgeData = function( user_id, from_node_name, to_node_name, is_hide_user ) {
	return {
		user_id: user_id,
		from_node: from_node_name,
		to_node: to_node_name,
		is_hide_user: is_hide_user,
	};
};

db.changeUsersDB = function( snapshot ) {
	var data = snapshot.val();
	
	if( accept.current_id == snapshot.key ) {
		// ログインユーザの情報
		if( !!data && !!data["gaze"] ) {
			// 注視nodeをデコード
			var setData = {};
			Object.keys(data["gaze"]).forEach(function(key) {
				setData[db.convertPathEntities(key, "decode")] = data["gaze"][key];
			});
			//console.log("set data:", setData);
			data["gaze"] = setData;
			//console.log("conv data:", data);
		}
		// 全データ取得
		db.data.users[snapshot.key] = data;
	} else if( !!data && !!data["edges"] ) {
		// edgesのみ取得
		db.data.users[snapshot.key] = {edges: data["edges"]};
	} else {
		db.data.users[snapshot.key] = undefined;
	}
	
	//console.log("GET : users update " + snapshot.key);
	//console.log(db.data.users[snapshot.key]);

	if( !accept.current_id ) return;
	// ログイン時のみ
	if( accept.current_id != snapshot.key ) return;
	// ログインユーザとIDが一致
	if( db.data.users[accept.current_id] ) return;
	// ログインユーザのデータがない
	
	// ツアー自動発動
	guide.setTourRestart();
};

db.changeEdgesDB = function( snapshot ) {
	var orgData = snapshot.val();
	db.data.edges = {};
	if( orgData == null ) return;
	Object.keys(orgData).forEach(function(key) {
		var setData = {};
		Object.keys(orgData[key]).forEach(function(dataName) {
			setData[db.convertPathEntities(dataName, "decode")] = orgData[key][dataName];
		});
		db.data.edges[db.convertPathEntities(key, "decode")] = setData;
	});
	//console.log("GET : edges update");
	//console.log(db.data.edges);
	
	if( !!db.data.users[accept.current_id] ) {
		// 通知を確認
		db.renewNotification();
	}
	
	// データ取得後、該当ハッシュがあれば共感者一覧を表示
	dom.showUserModalFromHash();
};


db.childAddedUserEdgesDB = function( childSnapshot, prevChildKey ) {
	var edge = childSnapshot.val();
	var edge_id = childSnapshot.key;
	var user_id = childSnapshot.ref.parent.parent.key;
	canvas.addEdge(edge_id, user_id, db.convertPathEntities(edge.from_node, "decode"), db.convertPathEntities(edge.to_node, "decode"));
	//console.log("GET : edge child_added : " + edge.from_node + " -> " + edge.to_node);
};

db.childRemovedUserEdgesDB = function( childSnapshot, prevChildKey ) {
	var edge = childSnapshot.val();
	var edge_id = childSnapshot.key;
	var user_id = childSnapshot.ref.parent.parent.key;
	canvas.removeEdge(edge_id, user_id, edge.from_node, edge.to_node);
	//console.log("GET : edge child_removed : " + edge.from_node + " -> " + edge.to_node);
};

db.childAddedUserGazeDB = function( childSnapshot, prevChildKey ) {
	canvas.addGaze( db.convertPathEntities(childSnapshot.key, "decode") );
	//console.log("GET : gaze child_added : " + db.convertPathEntities(childSnapshot.key, "decode"));
};

db.childRemovedUserGazeDB = function( childSnapshot, prevChildKey ) {
	canvas.removeGaze( db.convertPathEntities(childSnapshot.key, "decode") );
	//console.log("GET : gaze child_removed : " + db.convertPathEntities(childSnapshot.key, "decode"));
};


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
		// 表示対象のuserのedges
		var edgeRef = firebase.database().ref("users/" + user_id + "/edges").orderByChild("created_at");
		// 追加イベント監視
		edgeRef.off("child_added", db.childAddedUserEdgesDB);
		edgeRef.on("child_added", db.childAddedUserEdgesDB);
		// 削除イベント監視
		edgeRef.off("child_removed", db.childRemovedUserEdgesDB);
		edgeRef.on("child_removed", db.childRemovedUserEdgesDB);
	});
	
	if( !accept.current_id ) return;
	// ログイン時のみ
	
	// 注視設定
	var gazeRef = firebase.database().ref("users/" + accept.current_id + "/gaze").orderByChild("created_at");
	// 追加イベント監視
	gazeRef.off("child_added", db.childAddedUserGazeDB);
	gazeRef.on("child_added", db.childAddedUserGazeDB);
	// 削除イベント監視
	gazeRef.off("child_removed", db.childRemovedUserGazeDB);
	gazeRef.on("child_removed", db.childRemovedUserGazeDB);
};
