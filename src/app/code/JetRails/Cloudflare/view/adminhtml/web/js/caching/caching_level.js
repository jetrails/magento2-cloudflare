const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")
const common = require ("cloudflare/common")

$(document).on ( "cloudflare.caching.caching_level.initialize", ( event, data ) => {
	var label = data.response.result.value
	$(data.section).find ("input[name='value'][value='" + label + "']").prop ( "checked", true )
})

$(document).on ( "cloudflare.caching.caching_level.update", ( event, data ) => {
	var newValue = $(data.section).find ("input[name='value']:checked").val ()
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "value": newValue },
		success: ( response ) => {
			notification.showMessages ( response )
			common.loadSections (".caching_level")
		}
	})
})
