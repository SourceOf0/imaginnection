
/* global $ */
/* global Tour */


var imaginnection = imaginnection || {};


/**
 * ツアー遷移
 */
 
imaginnection.setTour = function( index ) {
  let current = imaginnection.tour.getCurrentStep();
  if( !current || current == index ) return;
  imaginnection.tour.goTo(index);
};


/**
 * ツアー初期化
 */
 
imaginnection.initTour = function() {
  
  let can_tap = window.ontouchstart === null;
  
  let temp = "";
  temp += "<div class='popover tour' role='tooltip'>";
  temp += "  <div class='arrow'></div>";
  temp += "  <h3 class='popover-title'></h3>";
  temp += "  <div class='popover-content'></div>";
  temp += "  <div class='popover-navigation'>";
  temp += "    <button class='btn btn-default btn-sm' data-role='next'>はい</button>";
  temp += "    <button class='btn btn-default btn-sm' data-role='end'>いいえ</button>";
  temp += "  </div>";
  temp += "</div>";
  
  let temp_def = "";
  temp_def += "<div class='popover tour' role='tooltip'>";
  temp_def += "  <div class='arrow'></div>";
  temp_def += "  <h3 class='popover-title'></h3>";
  temp_def += "  <div class='popover-content'></div>";
  temp_def += "  <div class='popover-navigation'>";
  temp_def += "    <button type='button' class='btn btn-default btn-sm' data-role='next'>進む</button>";
  temp_def += "    <button class='btn btn-default btn-sm' data-role='end'>終了</button>";
  temp_def += "  </div>";
  temp_def += "</div>";

  let temp_wait = "";
  temp_wait += "<div class='popover tour'>";
  temp_wait += "  <div class='arrow'></div>";
  temp_wait += "  <h3 class='popover-title'></h3>";
  temp_wait += "  <div class='popover-content'></div>";
  temp_wait += "  <div class='popover-navigation'>";
  temp_wait += "    <button class='btn btn-default btn-sm' data-role='end'>終了</button>";
  temp_wait += "  </div>";
  temp_wait += "</div>";
  
  imaginnection.tour = new Tour({
    name: "tour",
    steps: [
      {
        template: temp,
        element: "#tour-icon",
        title: "操作ガイドツアー",
        content: "基本操作説明を実際に操作しながら行います。開始しますか？",
        placement: "left",
      },
      {
        template: temp_def,
        title: "チュートリアルその1",
        content: "ここに自分と自分のフォローしている人が作成した連想した単語のマップが表示されます。",
        orphan: true,
      },
      {
        template: temp_wait,
        element: "#new-node-icon",
        title: "チュートリアルその2",
        content: "まず新規作成ウインドウを開きます。",
        placement: "right",
      },
      {
        template: temp_wait,
        element: "#node-new-form #node_name",
        title: "チュートリアルその3",
        content: "単語を入力して「次へ」を押します。",
        placement: "top",
        path: "/edges#node-new",
      },
      {
        template: temp_wait,
        element: "#edge-new-form #node_name",
        title: "チュートリアルその4",
        content: "先ほど入力した単語から連想する単語を入力して「作成」を押します。",
        placement: "top",
      },
      {
        template: temp_def,
        element: "#edges-index .target-node",
        title: "チュートリアルその5",
        content: "単語はマップに反映されます。<br><small>　選択：円を" + (can_tap? "タップ":"右クリック" ) + "<br>　回転：" + (can_tap? "スライド":"右ドラッグ" ) + "<br>　移動：" + (can_tap? "指2本でスライド":"左ドラッグ" ) + "<br>　拡縮：" + (can_tap? "ピンチ":"マウスホイール回転" ) + "</small>",
        placement: "auto top",
      },
      {
        template: temp_def,
        element: ".zoom-button",
        title: "チュートリアルその6",
        content: "このボタンでもズームできます。",
        placement: "left",
      },
    ],
    container: "body",
    smartPlacement: true,
    keyboard: true,
    storage: false,
    debug: true,
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

  imaginnection.tour.init();
};
