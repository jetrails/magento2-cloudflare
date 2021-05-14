const $ = jQuery = jquery = require ("jquery")
const notification = require ("cloudflare/core/notification")
const common = require ("cloudflare/common")

$(document).on ( "cloudflare.speed.auto_minify.initialize", ( event, data ) => {
	var jsState = data.response.result.value.js === "on"
	var cssState = data.response.result.value.css === "on"
	var htmlState = data.response.result.value.html === "on"
	$(data.section).find ("input[value='javascript']").prop ( "checked", jsState )
	$(data.section).find ("input[value='css']").prop ( "checked", cssState )
	$(data.section).find ("input[value='html']").prop ( "checked", htmlState )
})

$(document).on ( "cloudflare.speed.auto_minify.change", ( event, data ) => {
	var jsVal = $(data.section).find ("input[value='javascript']").prop ("checked")
	var cssVal = $(data.section).find ("input[value='css']").prop ("checked")
	var htmlVal = $(data.section).find ("input[value='html']").prop ("checked")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "js": jsVal, "css": cssVal, "html": htmlVal },
		success: ( response ) => {
			notification.showMessages ( response )
			common.loadSections (".auto_minify")
		}
	})
})
