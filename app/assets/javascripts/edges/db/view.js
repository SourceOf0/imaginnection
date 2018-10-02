
/* global $ */
/* global accept */
/* global guide */

var db = db || {};


/** 
 * edge関連
 */

// 共感者データ取得
db.getUserList = function( from_node_name, to_node_name ) {
	// ログイン時のみ
	if( !accept.current_id ) return null;
	
	var post_data = [];
	var count = 0;
	var is_hide_user = undefined;
	
	if( !db.data.edges[from_node_name] ) {
		return {is_hide_user: is_hide_user, content: post_data, count: count};
	}
	
	var data = db.data.edges[from_node_name][to_node_name];
	if( !data || !data["users"] ) {
		return {is_hide_user: is_hide_user, content: post_data, count: count};
	}
	
	var users = data["users"];
	for( var key in users ) {
		count++;
		if( key == accept.current_id ) {
			if( users[key].is_hide_user ) {
				is_hide_user = "1";
			}
			post_data.push(key);
		} else if( !users[key].is_hide_user ) {
			post_data.push(key);
		}
	}

	return {is_hide_user: is_hide_user, content: post_data, count: count};
};


// 共感者一覧表示
db.viewUserList = function( from_node_name, to_node_name ) {
	// ログイン時のみ
	if( !accept.current_id ) return;
	
	var forward_data = db.getUserList( from_node_name, to_node_name );
	var backward_data = db.getUserList( to_node_name, from_node_name );

	$.ajax({
		url: "/edges/users",
		type: "GET",
		data: {from_node: from_node_name, to_node: to_node_name, forward_data, backward_data},
		datatype: "html",
	}).done(function(data) {
		guide.setTour(9, [8]);
	});
};

