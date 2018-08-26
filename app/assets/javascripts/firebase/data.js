
var imaginnection = imaginnection || {};

imaginnection.dbdata = {};


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
};

imaginnection.changeEdgesDB = function( snapshot ) {
  imaginnection.dbdata.edges = snapshot.val();
  //console.log("GET : edges update");
  //console.log(imaginnection.dbdata.edges);
};


imaginnection.childAddedUsersDB = function( childSnapshot, prevChildKey ) {
  let edge = childSnapshot.val();
  let edge_id = childSnapshot.key;
  let user_id = childSnapshot.ref.parent.parent.key;
  if( imaginnection.three ) {
    imaginnection.three.addEdge(edge_id, user_id, edge.from_node, edge.to_node);
  } else {
    imaginnection.addEdgeList(edge_id, user_id, edge.from_node, edge.to_node);
  }
  //console.log("GET : child_added : " + edge.from_node + " -> " + edge.to_node);
};

imaginnection.childRemovedUsersDB = function( childSnapshot, prevChildKey ) {
  let edge = childSnapshot.val();
  let edge_id = childSnapshot.key;
  let user_id = childSnapshot.ref.parent.parent.key;
  if( imaginnection.three ) {
    imaginnection.three.removeEdge(edge_id, user_id, edge.from_node, edge.to_node);
  } else {
    imaginnection.removeEdgeList(edge_id, user_id, edge.from_node, edge.to_node);
  }
  //console.log("GET : child_removed : " + edge.from_node + " -> " + edge.to_node);
};
