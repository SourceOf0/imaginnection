
/* global $ */
/* global firebase */
/* global accept */


var db = db || {};


// edgeのバリデーション
db.validateEdge = function( edge ) {
  if( edge.user_id != accept.current_id ) return "投稿に失敗しました";
  if( edge.from_node == edge.to_node ) return "前後で同じ名前の単語は使用できません";
  return null;
};

// userが持つedgeを作成
// @return: 追加したedgeのkey
db.createUserEdge = function( edge ) {
  var ref = firebase.database().ref().child( "users/" + edge["user_id"] + "/edges" ).push({
    from_node: edge["from_node"],
    to_node: edge["to_node"],
    created_at: firebase.database.ServerValue.TIMESTAMP,
  });
  return ref.getKey();
};

// userが持つedgeを削除
db.removeUserEdge = function( edge, edge_id ) {
  if(!edge_id) return;
  firebase.database().ref().child( "users/" + edge["user_id"] + "/edges/" + edge_id ).remove();
};



// edge更新
// @return: 更新完了ならtrue, 新規追加ならfalse
db.updateEdge = function( edge, is_remove ) {
  var updates = {};
  var timestamp = firebase.database.ServerValue.TIMESTAMP;
  
  // パス定義
  var path = "edges";
  var from_node_path = path + "/" + db.convertPathEntities(edge["from_node"], "encode");
  var to_node_path = from_node_path + "/" + db.convertPathEntities(edge["to_node"], "encode");
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
  
  var edges = db.data.edges;
  if( !edges ) {
    // edges以下を作成して終了
    updates[from_node_path + "/created_at"] = timestamp;
    updates[to_node_path + "/created_at"] = timestamp;
    if( !is_remove ) {
      updates[user_path + "/edge_id"] = db.createUserEdge(edge);
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
      updates[user_path + "/edge_id"] = db.createUserEdge(edge);
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
      updates[user_path + "/edge_id"] = db.createUserEdge(edge);
      updates[user_path + "/created_at"] = timestamp;
    }
    firebase.database().ref().update(updates);
    return false;
  }
  
  var users = to_node["users"];
  var user = (users)? users[edge["user_id"]] : null;
  
  if( !user && !is_remove ) {
    // user_id以下を作成して終了
    updates[user_path + "/edge_id"] = db.createUserEdge(edge);
    updates[user_path + "/created_at"] = timestamp;
    firebase.database().ref().update(updates);
    return false;
  }
  
  if( user && is_remove ) {
    // usersから削除
    db.removeUserEdge(edge, user["edge_id"]);
  }
  
  // 更新して終了
  firebase.database().ref().update(updates);
  return true;
};


// edge作成
db.createEdge = function( edge ) {
  
  // バリデーション
  var checkResult = db.validateEdge(edge);
  if( checkResult ) {
    $("#info-modal").html(
      "<div class='modal-dialog'><div class='modal-content'><div class='modal-body'>" + 
      checkResult +
      "</div></div></div>"
      ).modal("show");
    return false;
  }
  
  if( db.updateEdge(edge) ) {
    //console.log("update: " + edge.from_node + " -> " + edge.to_node);
  } else {
    //console.log("create: " + edge.from_node + " -> " + edge.to_node);
  }
  
  return true;
};


// edge削除
db.removeEdge = function( edge ) {
  if( db.updateEdge(edge, true) ) {
    //console.log("delete: " + edge.from_node + " -> " + edge.to_node);
  } else {
    //console.log("not found: " + edge.from_node + " -> " + edge.to_node);
  }
};

// データチェック用
/*
setTimeout(function() {
  var edges = db.data.edges;
  var users = db.data.users;
  
  Object.keys(users).forEach(function(id) {
    var check = {};
    Object.keys(users[id]["edges"]).forEach(function(key) {
      var user = users[id]["edges"][key];
      var from_node = user["from_node"];
      var to_node = user["to_node"];
      var edge = from_node + "->" + to_node;
      if( !check[edge] ) {
        check[edge] = true;
      } else {
        console.log("same user edge: ", id, key, users[id]["edges"][key]);
      }
      if( !edges[from_node][to_node] ) {
        console.log("undefined edge: ", id, key, users[id]["edges"][key]);
      }
    });
  });
}, 3000);
/**/

// テスト用
/*
setTimeout(function() {
  var id = "jlRrvBcYf6hiIOPVAiTjG4sEY5f6c0i_NOGT3pim";
  //var id = "CCZvQH4FurVebU6NDlazhs-a3tXDHfy_HqGP-qz5";
  for( var i = 0; i < 100; i++ ) {
    for( var j = 0; j < 20; j++ ) {
      var edge = db.createEdgeData(id, i + "個目", i + "個目の" + j + "個目", false);
      db.createEdge(edge);
      //db.removeEdge(edge);
    }
  }
}, 3000);
/**/
