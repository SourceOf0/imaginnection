
/* global $ */
/* global firebase */

/* global view_ids */


var imaginnection = imaginnection || {};


// user作成
imaginnection.createUser = function( edge ) {
  // TODO: 重複チェック
  // usersにuser_idとedge_idを登録
  firebase.database().ref().child( "users/" + edge["user_id"] + "/edges" ).push({
    from_node: edge["from_node"],
    to_node: edge["to_node"],
    created_at: firebase.database.ServerValue.TIMESTAMP,
  });
};

// edgeのバリデーション
imaginnection.validateEdge = function( edge ) {
  // TODO
  return null;
};

// edge更新
// @return: 更新完了ならtrue, 新規追加ならfalse
imaginnection.updateEdge = function( edge ) {
  var updates = {};
  var timestamp = firebase.database.ServerValue.TIMESTAMP;
  
  // パス定義
  var path = "edges";
  var from_node_path = path + "/" + edge["from_node"];
  var to_node_path = from_node_path + "/" + edge["to_node"];
  var user_path = to_node_path + "/users/" + edge["user_id"];
  
  // 更新情報セット
  updates[from_node_path + "/updated_at"] = timestamp;
  updates[to_node_path + "/updated_at"] = timestamp;
  updates[user_path + "/updated_at"] = timestamp;
  updates[user_path + "/is_hide_user"] = edge["is_hide_user"];
  
  var edges = imaginnection.dbdata.edges;
  if( edges ) {
  } else {
    // edges以下を作成して終了
    updates[from_node_path + "/created_at"] = timestamp;
    updates[to_node_path + "/created_at"] = timestamp;
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }

  var from_node = edges[edge["from_node"]];
  if( from_node ) {
  } else {
    // from_node以下を作成して終了
    updates[from_node_path + "/created_at"] = timestamp;
    updates[to_node_path + "/created_at"] = timestamp;
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }
  
  var to_node = from_node[edge["to_node"]];
  if( to_node ) {
  } else {
    // to_node以下を作成して終了
    updates[to_node_path + "/created_at"] = timestamp;
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }
  
  var user = to_node["users"][edge["user_id"]];
  if( user ) {
    // 更新して終了
    console.log("update edge");
    firebase.database().ref().update(updates);
    return true;
  } else {
    // user_id以下を作成して終了
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }
};

// edge作成
imaginnection.createEdge = function( user_id, from_node_name, to_node_name, is_hide_user ) {

  var edge = {
    user_id: user_id,
    from_node: from_node_name,
    to_node: to_node_name,
    is_hide_user: is_hide_user,
  };
  
  // バリデーション
  var checkResult = imaginnection.validateEdge(edge);
  if( checkResult ) {
    return;
  }
  
  // 更新の場合は更新処理をして終了
  if( imaginnection.updateEdge(edge) ) return;
  
  // 新規投稿のため、userに情報を追加
  imaginnection.createUser( edge );
  
  console.log("create edge");
};


// テスト用
/*
setTimeout(function() {
  var id = "YX-Vd3h1H9DV_KXDw6kFWCwutK6KVbKf0sE5f-Ku";
  imaginnection.createEdge(id, "test", "です", false);
}, 3000);
*/
