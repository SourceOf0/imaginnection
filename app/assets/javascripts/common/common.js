/* global $ */

window.onerror = function(msg, url, line, col, error) {
  var text = "<div style='color: red;'>";
  text += "<p>[msg]"  + msg  + "</p>";
  text += "<p>[url]"  + url  + "</p>";
  text += "<p>[line]" + line + "</p>";
  text += "<p>[col]"  + col  + "</p>";
  text += "<p>[error]"  + error.stack  + "</p>";
  text += "</div>";
  $("#log-view").append(text);
  text = "js error: " + text.replace(/<.+?>/g, "");
  $.ajax({
    url: "/logs",
    type: "POST",
    data: {text: text},
    datatype: "json",
  });
};
