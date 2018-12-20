
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
