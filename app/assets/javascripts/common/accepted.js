
/* global $ */

$(function(){
  $("#accepted").click(function(){
    if( this.checked ) {
      $("#sign-up-button").removeClass("disabled");
    } else {
      $("#sign-up-button").addClass("disabled");
    }
  });
});
