
/* global firebase */


/** 
 * firebase初期化
 */
if( !firebase.apps.length ) {
  var config = {
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
    var usersSnapshot = firebase.database().ref("users/" + id);
    usersSnapshot.off("value");
    usersSnapshot.on("value", function(usersSnapshot) {
      imaginnection.dbdata.users[id] = usersSnapshot.val();
    });
  });
  
  // edges
  imaginnection.dbdata.edges = {};
  var edgesSnapshot = firebase.database().ref("edges");
  edgesSnapshot.off("value");
  edgesSnapshot.on("value", function(edgesSnapshot) {
    imaginnection.dbdata.edges = edgesSnapshot.val();
  });
  
};
