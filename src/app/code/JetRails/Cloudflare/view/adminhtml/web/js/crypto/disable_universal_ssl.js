const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")
const common = require ("cloudflare/common")

$(document).on ( "cloudflare.crypto.disable_universal_ssl.initialize", function ( event, data ) {
	if ( !data.response.result.enabled ) {
		$(data.section).find ("[name='button']").val ("Enable Universal SSL")
		$(data.section).find ("[name='button']").data ( "action", "enable" )
	}
	else {
		$(data.section).find ("[name='button']").val ("Disable Universal SSL")
		$(data.section).find ("[name='button']").data ( "action", "disable" )
	}
})

function triggerChange ( data ) {
	let value = $(data.trigger).data ("action") == "enable"
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "state": value },
		success: function ( response ) {
			notification.showMessages ( response )
			$("section.cloudflare.crypto.ssl").addClass ("loading")
			common.loadSections (".crypto.disable_universal_ssl")
		}
	})
}

$(document).on ( "cloudflare.crypto.disable_universal_ssl.toggle", function ( event, data ) {
	if ( $(data.trigger).data ("action") == "disable" ) {
		let agreement = new modal.Modal ( 800 )
		agreement.addTitle ("Acknowledgement")
		agreement.addElement ( $("<p>").text ("By disabling Universal SSL, you understand that the following Cloudflare settings and preferences will result in visitors being unable to visit your domain unless you have uploaded a custom certificate or purchased a dedicated certificate.") )
		agreement.addElement ( $("<ul>")
			.append ( $("<li>").text ("HSTS") )
			.append ( $("<li>").text ("Always Use HTTPS") )
			.append ( $("<li>").text ("Opportunistic Encryption") )
			.append ( $("<li>").text ("Any Page Rules redirecting traffic to HTTPS") )
		)
		agreement.addElement ( $("<p>").text ("Similarly, any HTTP redirect to HTTPS at the origin while the Cloudflare proxy is enabled will result in users being unable to visit your site without a valid certificate at Cloudflare’s edge.") )
		agreement.addElement ( $("<p>").text ("If you do not have a valid custom or dedicated certificate at Cloudflare’s edge and are unsure if any of the above Cloudflare settings are enabled, or if any HTTP redirects exist at your origin, we advise leaving Universal SSL enabled for your domain.") )
		agreement.addButton ({ label: "Cancel", class: "gray", callback: agreement.close })
		agreement.addButton ({ label: "I Understand", class: "red", callback: ( components ) => {
			agreement.close ()
			triggerChange ( data )
		}})
		agreement.show ()
	}
	else {
		triggerChange ( data )
	}
})
