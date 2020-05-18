const $ = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")

$(document).on ( "cloudflare.speed.polish.initialize", ( event, data ) => {
	var value = data.response.state.result.value
	var webp = data.response.webp.result.value == "on"
	$(data.section).find ("[name='value']").val ( value )
	$(data.section).find ("[name='webp']").prop ( "checked", webp )
	if ( !data.response.state.result.editable ) {
		var button = "<a href='https://www.cloudflare.com/plans/' target='_blank' ><input type='button' value='Upgrade to Pro' /></a>"
		$(data.section).find (".wrapper_right > div").eq ( 0 ).html ( button )
	}
})

$(document).on ( "cloudflare.speed.polish.change", ( event, data ) => {
	let value = $(data.section).find ("[name='value']").val ()
	let webp = $(data.section).find ("[name='webp']").prop ("checked")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "value": value, "webp": webp },
		success: ( response ) => {
			notification.showMessages (  response )
			common.loadSections (".polish")
		}
	})
})
