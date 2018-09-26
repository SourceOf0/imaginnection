
var imaginnection = imaginnection || {};

imaginnection.dbdata = {};


// Firebaseのパス名に使用不可な文字列を変換
imaginnection.convertPathEntities = function( text, proc ) {
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

imaginnection.createEdgeData = function( user_id, from_node_name, to_node_name, is_hide_user ) {
  return {
    user_id: user_id,
    from_node: from_node_name,
    to_node: to_node_name,
    is_hide_user: is_hide_user,
  };
};

imaginnection.changeUsersDB = function( snapshot ) {
  imaginnection.dbdata.users[snapshot.key] = snapshot.val();
  //console.log("GET : users update " + snapshot.key);
  //console.log(imaginnection.dbdata.users[snapshot.key]);

  if( !imaginnection.current_id ) return;
  // ログイン時のみ
  if( imaginnection.current_id != snapshot.key ) return;
  // ログインユーザとIDが一致
  if( imaginnection.dbdata.users[imaginnection.current_id] ) return;
  // ログインユーザのデータがない
  
  // ツアー自動発動
  imaginnection.setTourRestart();
};

imaginnection.changeEdgesDB = function( snapshot ) {
  var orgData = snapshot.val();
  imaginnection.dbdata.edges = {};
  if( orgData == null ) return;
  Object.keys(orgData).forEach(function(key) {
    var setData = {};
    Object.keys(orgData[key]).forEach(function(dataName) {
      setData[imaginnection.convertPathEntities(dataName, "decode")] = orgData[key][dataName];
    });
    imaginnection.dbdata.edges[imaginnection.convertPathEntities(key, "decode")] = setData;
  });
  //console.log("GET : edges update");
  //console.log(imaginnection.dbdata.edges);
};


imaginnection.childAddedUsersDB = function( childSnapshot, prevChildKey ) {
  var edge = childSnapshot.val();
  var edge_id = childSnapshot.key;
  var user_id = childSnapshot.ref.parent.parent.key;
  
  imaginnection.three.addEdge(edge_id, user_id, imaginnection.convertPathEntities(edge.from_node, "decode"), imaginnection.convertPathEntities(edge.to_node, "decode"));

  //console.log("GET : child_added : " + edge.from_node + " -> " + edge.to_node);
};

imaginnection.childRemovedUsersDB = function( childSnapshot, prevChildKey ) {
  var edge = childSnapshot.val();
  var edge_id = childSnapshot.key;
  var user_id = childSnapshot.ref.parent.parent.key;
  imaginnection.three.removeEdge(edge_id, user_id, edge.from_node, edge.to_node);
  //console.log("GET : child_removed : " + edge.from_node + " -> " + edge.to_node);
};
