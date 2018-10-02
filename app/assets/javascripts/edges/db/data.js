
/* global firebase */
/* global accept */
/* global canvas */

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
	db.data.users[snapshot.key] = snapshot.val();
	//console.log("GET : users update " + snapshot.key);
	//console.log(db.data.users[snapshot.key]);

	if( !accept.current_id ) return;
	// ログイン時のみ
	if( accept.current_id != snapshot.key ) return;
	// ログインユーザとIDが一致
	if( db.data.users[accept.current_id] ) return;
	// ログインユーザのデータがない
	
	// ツアー自動発動
	db.setTourRestart();
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
};


db.childAddedUsersDB = function( childSnapshot, prevChildKey ) {
	var edge = childSnapshot.val();
	var edge_id = childSnapshot.key;
	var user_id = childSnapshot.ref.parent.parent.key;
	
	canvas.addEdge(edge_id, user_id, db.convertPathEntities(edge.from_node, "decode"), db.convertPathEntities(edge.to_node, "decode"));

	//console.log("GET : child_added : " + edge.from_node + " -> " + edge.to_node);
};

db.childRemovedUsersDB = function( childSnapshot, prevChildKey ) {
	var edge = childSnapshot.val();
	var edge_id = childSnapshot.key;
	var user_id = childSnapshot.ref.parent.parent.key;
	canvas.removeEdge(edge_id, user_id, edge.from_node, edge.to_node);
	//console.log("GET : child_removed : " + edge.from_node + " -> " + edge.to_node);
};
