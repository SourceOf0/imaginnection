
/* global $ */

$(function(){
	$("#accepted").click(function(){
		$("#sign-up-button").prop("disabled", !this.checked);
	});
});
