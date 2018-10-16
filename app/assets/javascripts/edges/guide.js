
/* global Tour */

var guide = guide || {};


/**
 * ステップ遷移
 */
guide.setTour = function( index, conditionStep ) {
	if( !guide.tour ) return;
	var current = guide.tour.getCurrentStep();
	//console.log("CHECK: ", index, current, conditionStep );
	if( !!conditionStep && conditionStep.indexOf(current) < 0 ) return;
	//console.log("OK");
	if( !current || current == index ) return;
	setTimeout( function() {
		guide.tour.goTo(index);
	}, 300);
};

/**
 * ステップ取得
 */
guide.getTourStep = function() {
	if( !guide.tour ) return -1;
	return guide.tour.getCurrentStep();
};

/**
 * 最初から開始
 */
guide.setTourRestart = function() {
	if( !guide.tour ) return;
	guide.tour.init();
	guide.setTour(0);
	guide.tour.restart();
};

/**
 * 初期化
 */
guide.initTour = function() {
	
	var can_tap = window.ontouchstart === null;
	
	var temp = "";
	temp += "<div class='popover tour' role='tooltip'>";
	temp += "	<div class='arrow'></div>";
	temp += "	<h3 class='popover-title'></h3>";
	temp += "	<div class='popover-content'></div>";
	temp += "	<div class='popover-navigation'>";
	temp += "		<button class='btn btn-default btn-sm' data-role='next'>はい</button>";
	temp += "		<button class='btn btn-default btn-sm' data-role='end'>いいえ</button>";
	temp += "	</div>";
	temp += "</div>";
	
	var temp_def = "";
	temp_def += "<div class='popover tour' role='tooltip'>";
	temp_def += "	<div class='arrow'></div>";
	temp_def += "	<h3 class='popover-title'></h3>";
	temp_def += "	<div class='popover-content'></div>";
	temp_def += "	<div class='popover-navigation'>";
	temp_def += "		<button type='button' class='btn btn-default btn-sm' data-role='next'>進む</button>";
	temp_def += "		<button class='btn btn-default btn-sm' data-role='end'>終了</button>";
	temp_def += "	</div>";
	temp_def += "</div>";

	var temp_wait = "";
	temp_wait += "<div class='popover tour'>";
	temp_wait += "	<div class='arrow'></div>";
	temp_wait += "	<h3 class='popover-title'></h3>";
	temp_wait += "	<div class='popover-content'></div>";
	temp_wait += "	<div class='popover-navigation'>";
	temp_wait += "		<button class='btn btn-default btn-sm' data-role='end'>終了</button>";
	temp_wait += "	</div>";
	temp_wait += "</div>";
	
	guide.tour = new Tour({
		name: "tour",
		steps: [
			{
				template: temp,
				element: "#tour-icon",
				title: "操作ガイドツアー",
				content: "基本操作説明を実際に操作しながら行います。開始しますか？",
				placement: "auto left",
			},
			{
				template: temp_def,
				title: "メイン画面",
				content: "ここに自分と自分のフォローしている人が作成した連想した単語のマップが表示されます。",
				orphan: true,
			},
			{
				template: temp_wait,
				element: "#new-node-icon",
				title: "単語を作ろう",
				content: "まず「＋」で新規作成ウインドウを開きます。",
				placement: "auto right",
			},
			{
				template: temp_wait,
				element: "#node-new .form-control",
				title: "単語を作ろう",
				content: "単語を入力して「次へ」を押します。<br><small>趣味や目の前の物など、思いつくものを書いてみてください。<br>20文字まで入力できます。</small>",
				placement: "auto top",
			},
			{
				template: temp_wait,
				element: "#edge-new-forward .node-name-form",
				title: "連想しよう",
				content: "連想する単語を入力して「作成」を押します。<br><small>「好き」などの感想でも何でもOKです。<br>20文字まで入力できます。</small>",
				placement: "auto top",
			},
			{
				template: temp_def,
				title: "マップの操作",
				content: "単語はマップに反映されます。<br><small>　選択：円を" + (can_tap? "タップ":"右クリック" ) + "<br>　通知ON/OFF：もう一度選択" + "<br><br>　回転：" + (can_tap? "スライド":"右ドラッグ" ) + "<br>　移動：" + (can_tap? "指2本でスライド":"左ドラッグ" ) + "<br>　拡縮：" + (can_tap? "ピンチ":"マウスホイール回転" ) + "</small>",
				orphan: true,
			},
			{
				template: temp_def,
				element: "#associating",
				title: "単語を更に連想する",
				content: "現在選択中の単語から更に連想する場合はここのボタンを使用します。",
				placement: "auto top",
			},
			{
				template: temp_wait,
				element: "#drawer .glyphicon",
				title: "単語一覧",
				content: "画面端の「◀」を押すと、現在マップに表示されている単語の一覧が表示されます。<br><small>「▶」を押すと閉じます。</small>",
				placement: "auto left",
			},
			{
				template: temp_wait,
				title: "単語一覧",
				content: "単語を押すと、連想された単語の一覧が表示されます。<br>連想された単語を押すと、共感者の一覧が表示されます。",
				orphan: true,
			},
			{
				template: temp_def,
				element: "#empathy-user-list",
				title: "共感者一覧",
				content: "同じ単語を連想して紐づけた人たちが一覧で表示されます。<br>フォローするとその人の投稿内容が自分のマップにも反映されるようになります。",
				placement: "auto bottom",
			},
			{
				template: temp_def,
				element: "#forward-user-form .empathy-button .btn",
				title: "共感・削除",
				content: "自分が投稿した内容はここから削除できます。他人が投稿した内容に共感した場合もここから同じ内容で投稿できます。",
				placement: "auto top",
			},
			{
				template: temp_wait,
				title: "お疲れさまでした",
				content: "基本操作は以上です。終了ボタンでこの画面を閉じてください。どんどん単語を投稿していきましょう！",
				orphan: true,
			},
		],
		container: "body",
		smartPlacement: true,
		keyboard: true,
		storage: false,
		debug: false,
		backdrop: false,
		backdropContainer: 'body',
		backdropPadding: 0,
		redirect: true,
		orphan: false,
		duration: false,
		delay: false,
		basePath: "",
		template: "",
		afterGetState: function (key, value) {},
		afterSetState: function (key, value) {},
		afterRemoveState: function (key, value) {},
		onStart: function (tour) {},
		onEnd: function (tour) {},
		onShow: function (tour) {},
		onShown: function (tour) {},
		onHide: function (tour) {},
		onHidden: function (tour) {},
		onNext: function (tour) {},
		onPrev: function (tour) {},
		onPause: function (tour, duration) {},
		onResume: function (tour, duration) {},
		onRedirectError: function (tour) {}
	});
};
