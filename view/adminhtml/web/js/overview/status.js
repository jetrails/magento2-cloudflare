const $ = jQuery = jquery = require ("jquery")
const notification = require ("cloudflare/core/notification")

$(document).on ( "cloudflare.overview.status.initialize", function ( event, data ) {
	if ( data.response && data.response.result && data.response.result.paused ) {
		$(data.section).find (".section_title").text ("Resume")
		$(data.section).find (".wrapper_left > p").text ("Cloudflare has been temporarily deactivated for your domain. Cloudflare will continue to resolve DNS for your website, but all requests will go directly to your origin which means you will not receive the performance and security benefits. All of your settings have been saved.")
		$(data.section).find (".trigger").val ("Resume")
		$(data.section).find (".trigger").data ( "target", "resume" )
	}
	else {
		$(data.section).find (".section_title").text ("Pause Website")
		$(data.section).find (".wrapper_left > p").text ("Pause will temporarily deactivate Cloudflare for your domain. Cloudflare will continue to resolve DNS for your website, but all requests will go directly to your origin which means you will not receive performance and security benefits. All of your settings will be saved.")
		$(data.section).find (".trigger").val ("Pause")
		$(data.section).find (".trigger").data ( "target", "pause" )
	}
})

$(document).on ( "cloudflare.overview.status.pause", function ( event, data ) {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key },
		success: function ( response, status, xhr ) {
			// if ( ( xhr.getResponseHeader ("content-type") || "" ).indexOf ("json") < 0 ) {
			// 	alert ("Please log back in")
			// }
			$(data.section).removeClass ("loading")
			notification.showMessages ( response )
			if ( response.result && response.result.paused ) {
				$(data.section).find (".section_title").text ("Resume")
				$(data.section).find (".wrapper_left > p").text ("Cloudflare has been temporarily deactivated for your domain. Cloudflare will continue to resolve DNS for your website, but all requests will go directly to your origin which means you will not receive the performance and security benefits. All of your settings have been saved.")
				$(data.section).find (".trigger").val ("Resume")
				$(data.section).find (".trigger").data ( "target", "resume" )
			}
		}
	})
})

$(document).on ( "cloudflare.overview.status.resume", function ( event, data ) {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key },
		success: function ( response ) {
			$(data.section).removeClass ("loading")
			notification.showMessages ( response )
			if ( response.result && !response.result.paused ) {
				$(data.section).find (".section_title").text ("Pause Website")
				$(data.section).find (".wrapper_left > p").text ("Pause will temporarily deactivate Cloudflare for your domain. Cloudflare will continue to resolve DNS for your website, but all requests will go directly to your origin which means you will not receive performance and security benefits. All of your settings will be saved.")
				$(data.section).find (".trigger").val ("Pause")
				$(data.section).find (".trigger").data ( "target", "pause" )
			}
		}
	})
})
