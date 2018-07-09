
/* global firebase */


/** 
 * firebase初期化
 */
if( !firebase.apps.length ) {
  let config = {
    apiKey: "AIzaSyBymtFyHXt65wtX8F2qyXox5MP7qM0aaGw",
    authDomain: "imaginnection-56d13.firebaseapp.com",
    databaseURL: "https://imaginnection-56d13.firebaseio.com",
    storageBucket: "imaginnection-56d13.appspot.com",
  };
  firebase.initializeApp(config);
}


/** 
 * 共通
 */

var imaginnection = imaginnection || {};

imaginnection.dbdata = {};

// DB初期化
imaginnection.initDB = function() {
  
  // キャッシュデータを空にする
  imaginnection.dbdata = {};
  
  // 各種データの取得と更新イベント監視
  
  // users
  imaginnection.dbdata.users = {};
  imaginnection.view_ids.forEach( function(id) {
    let usersSnapshot = firebase.database().ref("users/" + id);
    usersSnapshot.off("value");
    usersSnapshot.on("value", function(usersSnapshot) {
      imaginnection.dbdata.users[id] = usersSnapshot.val();
    });
  });
  
  // edges
  imaginnection.dbdata.edges = {};
  let edgesSnapshot = firebase.database().ref("edges");
  edgesSnapshot.off("value");
  edgesSnapshot.on("value", function(edgesSnapshot) {
    imaginnection.dbdata.edges = edgesSnapshot.val();
  });
  
  // 追加イベント監視
  imaginnection.view_ids.forEach( function(user_id) {
    let edgeRef = firebase.database().ref("users/" + user_id + "/edges").orderByChild("created_at");
    edgeRef.off("child_added");
    edgeRef.on("child_added", function(childSnapshot, prevChildKey) {
      let edge = childSnapshot.val();
      if( imaginnection.three ) {
        imaginnection.three.addEdge(user_id, edge.from_node, edge.to_node);
      } else {
        imaginnection.addEdgeList(user_id, edge.from_node, edge.to_node);
      }
    });
  });
};
