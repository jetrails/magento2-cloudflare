const $ = require ("jquery")
const common = require ("cloudflare/common")
const modal = require ("cloudflare/core/modal")
const notification = require ("cloudflare/core/notification")

function maxAgeLabel ( value ) {
	if ( value >= 31536000 ) return "12 months"
	if ( value >= 15552000 ) return "6 months (recommended)"
	if ( value >= 12960000 ) return "5 months"
	if ( value >= 10368000 ) return "4 months"
	if ( value >= 7776000 ) return "3 months"
	if ( value >= 5184000 ) return "2 months"
	if ( value >= 2592000 ) return "1 month"
	return "0 (Disable)"
}

$(document).on ( "cloudflare.ssl_tls.http_strict_transport_security.initialize", function ( event, data ) {
	let options = data.response.result.value.strict_transport_security
	$(data.section).data ( "options", options )
	if ( options.enabled ) {
		$(data.section).find ("[name='button']").val ("Change HSTS Settings")
		$(data.section).find (".option_enabled").show ().find ("span").text ( options.enabled ? "On" : "Off" )
		$(data.section).find (".option_max_age").show ().find ("span").text ( maxAgeLabel ( options.max_age ) )
		$(data.section).find (".option_include_sub_domains").show ().find ("span").text ( options.include_subdomains ? "On" : "Off" )
		$(data.section).find (".option_preload").show ().find ("span").text ( options.preload ? "On" : "Off" )
		$(data.section).find (".option_no_sniff").show ().find ("span").text ( options.nosniff ? "On" : "Off" )
	}
	else {
		$(data.section).find ("[name='button']").val ("Enable HSTS")
		$(data.section).find (".option_enabled").hide ()
		$(data.section).find (".option_max_age").hide ()
		$(data.section).find (".option_include_sub_domains").hide ()
		$(data.section).find (".option_preload").hide ()
		$(data.section).find (".option_no_sniff").hide ()
	}
})

function createAcknowledgement ( options, callback ) {
	let acknowledgement = new modal.Modal ( 600 )
	acknowledgement.addTitle ("Acknowledgement")
	acknowledgement.addElement ( $("<p>").append ("HTTP Strict Transport Security (HSTS) can substantially improve the security of your website. However, there are important considerations to keep in mind when enabling HSTS:") )
	acknowledgement.addElement ( $("<p>").append ( $("<strong>").text ("HTTPS (SSL) must be enabled in order to use HSTS.") ) )
	acknowledgement.addElement ( $("<ul>")
		.append ( $("<li>").text ("If you turn on HSTS and do not have HTTPS for your website, browsers will not accept the HSTS setting.") )
		.append ( $("<li>").text ("If you have HSTS enabled and leave Cloudflare, you need to continue to support HTTPS through a new service provider otherwise your site will become inaccessible to visitors until you support HTTPS again.") )
		.append ( $("<li>").text ("If you turn off Cloudflare’s HTTPS while HSTS is enabled, and you don’t have a valid SSL certificate on your origin server, your website will become inaccessible to visitors.") )
	)
	acknowledgement.addElement ( $("<p>")
		.append ( $("<strong>").text ("Note") )
		.append (": Disabling Cloudflare’s HTTP can be done in several ways: Grey clouding a subdomain in your DNS records, “Pausing” the Cloudflare service, or having a misconfigured custom SSL certificate through your Cloudflare dashboard (e.g., invalid SSL certificates, expired certificates, or mismatched host names).")
	)
	acknowledgement.addElement ( $("<p>")
		.append ( $("<strong>").text ("If you need to disable HTTPS on your domain") )
		.append (", you must first disable HSTS in your Cloudflare dashboard and wait for the max-age to lapse to guarantee that every browser is aware of this change before you can disable HTTPS. The average max-age is six months (you can set the max-age in the next step). ")
		.append ( $("<strong>").text ("If you remove HTTPS before disabling HSTS your website will become inaccessible to visitors for up to the max-age or until you support HTTPS again.  ") )
		.append ("Because disabling HTTPS on an HSTS enabled website can have these consequences, we strongly suggest that you have a committed HTTPS service in place before enabling this feature.")
	)
	acknowledgement.addElement ( $("<a>").text ("More information").prop ( "target", "_blank" ).prop ( "href", "https://blog.cloudflare.com/enforce-web-policy-with-hypertext-strict-transport-security-hsts/" ) )
	acknowledgement.addButton ({ label: "Cancel", class: "gray", callback: acknowledgement.close })
	acknowledgement.addButton ({ label: "I Understand", class: "red", callback: ( components ) => {
		acknowledgement.close ()
		createConfigure ( options, callback )
	}})
	acknowledgement.show ()
}

function createConfigure ( options, callback ) {
	let configure = new modal.Modal ( 600 )
	let enabled = modal.createSwitch ( "enabled", options.enabled )
	let maxAge = modal.createSelect ( "max-age", [
		{ value: "0", label: maxAgeLabel ( 0 ) },
		{ value: "2592000", label: maxAgeLabel ( 2592000 ) },
		{ value: "5184000", label: maxAgeLabel ( 5184000 ) },
		{ value: "7776000", label: maxAgeLabel ( 7776000 ) },
		{ value: "10368000", label: maxAgeLabel ( 10368000 ) },
		{ value: "12960000", label: maxAgeLabel ( 12960000 ) },
		{ value: "15552000", label: maxAgeLabel ( 15552000 ) },
		{ value: "31536000", label: maxAgeLabel ( 31536000 ) },
	]).val ( options.max_age )
	let includeSubDomains = modal.createSwitch ( "include_subdomains", options.include_subdomains )
	let preload = modal.createSwitch ( "preload", options.preload )
	let noSniff = modal.createSwitch ( "nosniff", options.nosniff )
	configure.addTitle ("Configure")
	configure.addElement ( $(`<p style="font-size: 15.5px;" >`)
		.append ( $("<strong>").text ("Caution") )
		.append (": If misconfigured, HTTP Strict Transport Security (HSTS) can make your website inaccessible to users for an extended period of time.")
	)
	configure.addElement ( $("<table class='configure' >")
		.append ( $("<tr>")
			.append ( $("<td>")
				.append ( $("<strong>").text ("Enable HSTS (Strict-Transport-Security)") )
				.append ("Serve HSTS headers with all HTTPS requests")
			)
			.append ( $("<td>").append ( enabled ) )
		)
		.append ( $("<tr>")
			.append ( $("<td>")
				.append ( $("<strong>").text ("Max Age Header (max-age)") )
				.append ("Specify the duration HSTS headers are cached in browsers")
			)
			.append ( $("<td>").append ( maxAge ) )
		)
		.append ( $("<tr>")
			.append ( $("<td>")
				.append ( $("<strong>").text ("Apply HSTS policy to subdomains (includeSubDomains)") )
				.append ("Every domain below this will inherit the same HSTS headers")
				.append ("<b>Caution</b>: If any of your subdomains do not support HTTPS, they will become inaccessible.")
			)
			.append ( $("<td>").append ( includeSubDomains ) )
		)
		.append ( $("<tr>")
			.append ( $("<td>")
				.append ( $("<strong>").text ("Preload") )
				.append ("Permit browsers to preload HSTS configuration automatically")
				.append ("<b>Caution</b>: Preload can make a website without HTTPS support completely inaccessible.")
			)
			.append ( $("<td>").append ( preload ) )
		)
		.append ( $("<tr>")
			.append ( $("<td>")
				.append ( $("<strong>").text ("No-Sniff Header") )
				.append ("Send the “X-Content-Type-Options: nosniff” header to prevent Internet Explorer and Google Chrome from MIME-sniffing away from the declared Content-Type.")
			)
			.append ( $("<td>").append ( noSniff ) )
		)
	)
	configure.addButton ({ label: "Previous", class: "gray", callback: () => {
		configure.close ()
		createAcknowledgement ( options, callback )
	}})
	configure.addButton ({ label: "Cancel", class: "gray", callback: configure.close })
	configure.addButton ({ label: "Save", callback: ( components ) => {
		callback ( configure, {
			enabled: $(enabled).find ("[type='checkbox']:checked").length > 0,
			max_age: maxAge.val (),
			include_subdomains: $(includeSubDomains).find ("[type='checkbox']:checked").length > 0,
			preload: $(preload).find ("[type='checkbox']:checked").length > 0,
			nosniff: $(noSniff).find ("[type='checkbox']:checked").length > 0
		})
	}})
	configure.show ()
}

$(document).on ( "cloudflare.ssl_tls.http_strict_transport_security.update", function ( event, data ) {
	createAcknowledgement ( $(data.section).data ("options"), ( configure, config ) => {
		$(data.section).addClass ("loading")
		$(configure.components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "value": config },
			success: function ( response ) {
				notification.showMessages ( response )
				configure.close ()
				common.loadSections (".ssl_tls.http_strict_transport_security")
			}
		})
	})
})
