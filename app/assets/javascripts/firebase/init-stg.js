
/* global firebase */


/** 
 * firebase初期化
 */
if( !firebase.apps.length ) {
  var config = {
    apiKey: "AIzaSyAhEvquRhTrafzkZBDAovkenEV-Pl9r6wQ",
    authDomain: "imaginnection-stg.firebaseapp.com",
    databaseURL: "https://imaginnection-stg.firebaseio.com",
    storageBucket: "imaginnection-stg.appspot.com",
  };
  firebase.initializeApp(config);
}


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
    var usersSnapshot = firebase.database().ref("users/" + id);
    usersSnapshot.off("value", imaginnection.changeUsersDB);
    usersSnapshot.on("value", imaginnection.changeUsersDB);
  });
  
  // edges
  imaginnection.dbdata.edges = {};
  var edgesSnapshot = firebase.database().ref("edges");
  edgesSnapshot.off("value", imaginnection.changeEdgesDB);
  edgesSnapshot.on("value", imaginnection.changeEdgesDB);
  
  imaginnection.view_ids.forEach( function(user_id) {
    var edgeRef = firebase.database().ref("users/" + user_id + "/edges").orderByChild("created_at");
    // 追加イベント監視
    edgeRef.off("child_added", imaginnection.childAddedUsersDB);
    edgeRef.on("child_added", imaginnection.childAddedUsersDB);
    // 削除イベント監視
    edgeRef.off("child_removed", imaginnection.childRemovedUsersDB);
    edgeRef.on("child_removed", imaginnection.childRemovedUsersDB);
  });
};
