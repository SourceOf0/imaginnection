
/* global $ */
/* global firebase */

/* global current_id */
/* global view_ids */


var imaginnection = imaginnection || {};

/**
 * edge作成・投稿
 */

imaginnection.createEdge = function(user_id, from_node_name, to_node_name, is_hide_user) {

  var dbdata = imaginnection.dbdata;
  var target_edge_id;
  
  console.log("call");
  for( var edge_id in dbdata.edges ) {
    var edge = dbdata.edges[edge_id];
    if( edge.from_node !== from_node_name ) continue;
    if( edge.to_node !== to_node_name ) continue;
    target_edge_id = edge_id;
    console.log(target_edge_id);
    if( edge.users[user_id] ) {
      // ノード投稿済みならオプションのみ更新
      var path = "edges/" + target_edge_id + "/users/" + user_id;
      var updates = {};
      updates[path + "/is_hide_user"] = is_hide_user;
      updates[path + "/updated_at"] = firebase.database.ServerValue.TIMESTAMP;
      firebase.database().ref().update(updates);
      return;
    }
  }

  console.log("create");
  if( !target_edge_id ) {
    // edgeを作成
    console.log("create edge");
    var edge = firebase.database().ref().child("edges").push({
      from_node: from_node_name,
      to_node: to_node_name,
      created_at: firebase.database.ServerValue.TIMESTAMP,
      updated_at: firebase.database.ServerValue.TIMESTAMP,
    });
    target_edge_id = edge.key;
  }
  
  // user_idを登録
  firebase.database().ref().child("edges/" + target_edge_id + "/users/" + user_id).set({
    is_hide_user: is_hide_user,
    created_at: firebase.database.ServerValue.TIMESTAMP,
    updated_at: firebase.database.ServerValue.TIMESTAMP,
  });

  // usersにuser_idとedge_idを登録
  firebase.database().ref().child( "users/" + user_id + "/" + target_edge_id ).set({
    created_at: firebase.database.ServerValue.TIMESTAMP,
    updated_at: firebase.database.ServerValue.TIMESTAMP,
  });
};


$(document).ready(function() {
  imaginnection.initDB();
});

// テスト用
/*
setTimeout(function() {
  var id = "YX-Vd3h1H9DV_KXDw6kFWCwutK6KVbKf0sE5f-Ku";
  imaginnection.createEdge(id, "test", "です", false);
}, 3000);
*/