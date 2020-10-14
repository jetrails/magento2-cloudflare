const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")

function initializeCustom ( prop = "value", on = "on" ) {
	return function initialize ( event, data ) {
		let value
		if ( typeof prop === "object" && prop.constructor.name === "Array" ) {
			value = prop.reduce ( ( a, e ) => { return a [ e ] }, data.response.result )
		}
		else {
			value = data.response.result [ prop ]
		}
		$(data.section).find ("[name='mode']").prop ( "checked", value == on )
	}
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

module.exports = {
	initialize: initializeCustom (),
	toggle,
	initializeCustom,
}
