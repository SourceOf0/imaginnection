
/* global $ */
/* global guide */
/* global db */
/* global accept */

var ajax = ajax || {};

// 共感者一覧表示
ajax.viewUserList = function( from_node_name, to_node_name ) {
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
