
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
