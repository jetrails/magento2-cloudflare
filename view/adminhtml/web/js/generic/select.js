const $ = jQuery = jquery = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")

function initialize ( event, data ) {
	$(data.section).find ("[name='value']").val ( data.response.result.value )
	$(data.section).removeClass ("loading")
}

function update ( event, data ) {
	let value = $(data.section).find ("[name='value']").val ()
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "value": value },
		success: ( response ) => {
			notification.showMessages ( response )
			if ( response.success ) {
				$(data.section).removeClass ("loading")
			}
			else {
				let targetSection = `${data.target.tab}.${data.target.section}`
				common.loadSections (`.cloudflare.${targetSection}`)
			}
		}
	})
}

module.exports = { initialize, update }
