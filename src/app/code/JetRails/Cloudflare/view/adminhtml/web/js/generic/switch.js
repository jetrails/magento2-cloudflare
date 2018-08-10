const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")

function initialize ( event, data ) {
	var value = data.response.result.value == "on"
	$(data.section).find ("[name='mode']").prop ( "checked", value )
}

function toggle ( event, data ) {
	var state = $(data.section).find ("[name='mode']:checked").length > 0
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "state": state },
		success: ( response ) => {
			if ( !response.success ) {
				$(data.section)
					.find ("[name='mode']")
					.prop ( "checked", !state )
			}
			notification.showMessages ( response )
			$(data.section).removeClass ("loading")
		}
	})
}

module.exports = { initialize, toggle }
