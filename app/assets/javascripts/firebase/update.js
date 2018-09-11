
/* global $ */
/* global firebase */


var imaginnection = imaginnection || {};


// edgeのバリデーション
imaginnection.validateEdge = function( edge ) {
  if( edge.user_id != imaginnection.current_id ) return "投稿に失敗しました";
  if( edge.from_node == edge.to_node ) return "前後で同じ名前の単語は使用できません";
  return null;
};

// userが持つedgeを作成
// @return: 追加したedgeのkey
imaginnection.createUserEdge = function( edge ) {
  var ref = firebase.database().ref().child( "users/" + edge["user_id"] + "/edges" ).push({
    from_node: edge["from_node"],
    to_node: edge["to_node"],
    created_at: firebase.database.ServerValue.TIMESTAMP,
  });
  return ref.getKey();
};

// userが持つedgeを削除
imaginnection.removeUserEdge = function( edge, edge_id ) {
  if(!edge_id) return;
  firebase.database().ref().child( "users/" + edge["user_id"] + "/edges/" + edge_id ).remove();
};



// edge更新
// @return: 更新完了ならtrue, 新規追加ならfalse
imaginnection.updateEdge = function( edge, is_remove ) {
  var updates = {};
  var timestamp = firebase.database.ServerValue.TIMESTAMP;
  
  // パス定義
  var path = "edges";
  var from_node_path = path + "/" + imaginnection.convertPathEntities(edge["from_node"], "encode");
  var to_node_path = from_node_path + "/" + imaginnection.convertPathEntities(edge["to_node"], "encode");
  var user_path = to_node_path + "/users/" + edge["user_id"];
  
  //console.log("from_node_path: " + from_node_path);
  //console.log("to_node_path: " + to_node_path);
  
  // 更新情報セット
  updates[from_node_path + "/updated_at"] = timestamp;
  updates[to_node_path + "/updated_at"] = timestamp;
  if( is_remove ) {
    updates[user_path] = null;
  } else {
    updates[user_path + "/updated_at"] = timestamp;
    updates[user_path + "/is_hide_user"] = edge["is_hide_user"];
  }
  
  var edges = imaginnection.dbdata.edges;
  if( !edges ) {
    // edges以下を作成して終了
    updates[from_node_path + "/created_at"] = timestamp;
    updates[to_node_path + "/created_at"] = timestamp;
    if( !is_remove ) {
      updates[user_path + "/edge_id"] = imaginnection.createUserEdge(edge);
      updates[user_path + "/created_at"] = timestamp;
    }
    firebase.database().ref().update(updates);
    return false;
  }

  var from_node = edges[edge["from_node"]];
  if( !from_node ) {
    // from_node以下を作成して終了
    updates[from_node_path + "/created_at"] = timestamp;
    updates[to_node_path + "/created_at"] = timestamp;
    if( !is_remove ) {
      updates[user_path + "/edge_id"] = imaginnection.createUserEdge(edge);
      updates[user_path + "/created_at"] = timestamp;
    }
    firebase.database().ref().update(updates);
    return false;
  }
  
  var to_node = from_node[edge["to_node"]];
  if( !to_node ) {
    // to_node以下を作成して終了
    updates[to_node_path + "/created_at"] = timestamp;
    if( !is_remove ) {
      updates[user_path + "/edge_id"] = imaginnection.createUserEdge(edge);
      updates[user_path + "/created_at"] = timestamp;
    }
    firebase.database().ref().update(updates);
    return false;
  }
  
  var users = to_node["users"];
  var user = (users)? users[edge["user_id"]] : null;
  
  if( !user && !is_remove ) {
    // user_id以下を作成して終了
    updates[user_path + "/edge_id"] = imaginnection.createUserEdge(edge);
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }
  
  if( user && is_remove ) {
    // usersから削除
    imaginnection.removeUserEdge(edge, user["edge_id"]);
  }
  
  // 更新して終了
  firebase.database().ref().update(updates);
  return true;
};


// edge作成
imaginnection.createEdge = function( edge ) {
  
  // バリデーション
  var checkResult = imaginnection.validateEdge(edge);
  if( checkResult ) {
    alert(checkResult);
    return false;
  }
  
  if( imaginnection.updateEdge(edge) ) {
    console.log("update: " + edge.from_node + " -> " + edge.to_node);
  } else {
    console.log("create: " + edge.from_node + " -> " + edge.to_node);
  }
  
  return true;
};


// edge削除
imaginnection.removeEdge = function( edge ) {
  if( imaginnection.updateEdge(edge, true) ) {
    console.log("delete: " + edge.from_node + " -> " + edge.to_node);
  } else {
    console.log("not found: " + edge.from_node + " -> " + edge.to_node);
  }
};

// テスト用
/*
setTimeout(function() {
  var id = "vygUqlmpNU0Hz0zMqw7OydK2IA7MAGGsCre4VcYw";
  //var id = "bVQDGbw07EKBThh-fwIqLuWLU8b1mZnPs6WaEaYA";
  for( var i = 0; i < 300; i++ ) {
    var edge = imaginnection.createEdgeData(id, i + "個目", (i+1) + "個目", false);
    imaginnection.createEdge(edge);
    //imaginnection.removeEdge(edge);
  }
}, 3000);
/**/
