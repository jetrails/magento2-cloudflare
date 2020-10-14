const $ = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")

$(document).on ( "cloudflare.speed.mobile_redirect.initialize", ( event, data ) => {
	var domains = data.response.result.domains
	var setting = data.response.result.value
	$(data.section).find ("[name='mobile_subdomain']").html ("")
	for ( let domain of domains ) {
		$(data.section).find ("[name='mobile_subdomain']").append (
			$("<option>").prop ( "value", domain.value ).text ( domain.label )
		)
	}
	$(data.section).find ("[name='mobile_subdomain']").val ( setting.mobile_subdomain )
	$(data.section).find ("[name='strip_uri']").val ( setting.strip_uri + "" )
	$(data.section).find ("[name='status']").prop ( "checked", setting.status === "on" )
})

$(document).on ( "cloudflare.speed.mobile_redirect.change", ( event, data ) => {
	let mobileSubdomain = $(data.section).find ("[name='mobile_subdomain']").val ()
	let stripUri = $(data.section).find ("[name='strip_uri']").val ()
	let status = $(data.section).find ("[name='status']").prop ("checked")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"mobile_subdomain": mobileSubdomain,
			"status": status ? "on" : "off",
			"strip_uri": stripUri
		},
		success: ( response ) => {
			notification.showMessages (  response )
			common.loadSections (".mobile_redirect")
		}
	})
})
