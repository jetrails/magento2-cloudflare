const $ = jQuery = jquery = require ("jquery")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")
const common = require ("cloudflare/common")
const global = require ("cloudflare/global")

function upperCaseFirst ( target ) {
	target = target + ""
	return target.charAt ( 0 ).toUpperCase () + target.slice ( 1 )
}

function valueToLabel ( value ) {
	let lookup = {
		"pick_a_setting": "Pick a Setting",
		"always_online": "Always Online",
		"minify": "Auto Minify",
		"browser_cache_ttl": "Browser Cache TTL",
		"browser_check": "Browser Integrity Check",
		"bypass_cache_on_cookie": "Bypass Cache on Cookie",
		"cache_by_device_type": "Cache By Device Type",
		"cache_deception_armor": "Cache Deception Armor",
		"cache_level": "Cache Level",
		"cache_on_cookie": "Cache on Cookie",
		"disable_apps": "Disable Apps",
		"disable_performance": "Disable Performance",
		"disable_security": "Disable Security",
		"edge_cache_ttl": "Edge Cache TTL",
		"email_obfuscation": "Email Obfuscation",
		"forwarding_url": "Forwarding URL",
		"host_header_override": "Host Header Override",
		"ip_geolocation": "IP Geolocation Header",
		"mirage": "Mirage",
		"explicit_cache_control": "Origin Cache Control",
		"origin_error_page_pass_thru": "Origin Error Page Pass-thru",
		"polish": "Polish",
		"sort_query_string_for_cache": "Query String Sort",
		"resolve_override": "Resolve Override",
		"respect_strong_etag": "Respect Strong ETags",
		"response_buffering": "Response Buffering",
		"rocket_loader": "Rocket Loader",
		"security_level": "Security Level",
		"server_side_exclude": "Server Side Excludes",
		"ssl": "SSL",
		"true_client_ip_header": "True Client IP Header",
		"waf": "Web Application Firewall",
		"status_code": "Status Code",
		"url": "Url",
		"html": "HTML",
		"js": "JS",
		"css": "CSS"
	}
	if ( value in lookup ) {
		return lookup [ value ]
	}
	return "Undefined"
}

function createRow ( previousExists = false, values = [] ) {
	var close = $("<div class='cloudflare-font delete' >").html ("&#xF01A;")
	var row = $("<div class='dynamic_wrapper collection' >")
		.append ( modal.createSelect ( "setting", [
			{ label: "Pick a Setting", value: "pick_a_setting", disabled: true, selected: true },
			{ label: valueToLabel ("always_online"), value: "always_online" },
			{ label: valueToLabel ("minify"), value: "minify" },
			{ label: valueToLabel ("browser_cache_ttl"), value: "browser_cache_ttl" },
			{ label: valueToLabel ("browser_check"), value: "browser_check" },
			{ label: valueToLabel ("bypass_cache_on_cookie"), value: "bypass_cache_on_cookie" },
			{ label: valueToLabel ("cache_by_device_type"), value: "cache_by_device_type" },
			{ label: valueToLabel ("cache_deception_armor"), value: "cache_deception_armor" },
			{ label: valueToLabel ("cache_level"), value: "cache_level" },
			{ label: valueToLabel ("cache_on_cookie"), value: "cache_on_cookie" },
			{ label: valueToLabel ("disable_apps"), value: "disable_apps" },
			{ label: valueToLabel ("disable_performance"), value: "disable_performance" },
			{ label: valueToLabel ("disable_security"), value: "disable_security" },
			{ label: valueToLabel ("edge_cache_ttl"), value: "edge_cache_ttl" },
			{ label: valueToLabel ("email_obfuscation"), value: "email_obfuscation" },
			{ label: valueToLabel ("forwarding_url"), value: "forwarding_url", disabled: previousExists },
			{ label: valueToLabel ("host_header_override"), value: "host_header_override" },
			{ label: valueToLabel ("ip_geolocation"), value: "ip_geolocation" },
			{ label: valueToLabel ("mirage"), value: "mirage" },
			{ label: valueToLabel ("explicit_cache_control"), value: "explicit_cache_control" },
			{ label: valueToLabel ("origin_error_page_pass_thru"), value: "origin_error_page_pass_thru" },
			{ label: valueToLabel ("polish"), value: "polish" },
			{ label: valueToLabel ("sort_query_string_for_cache"), value: "sort_query_string_for_cache" },
			{ label: valueToLabel ("resolve_override"), value: "resolve_override" },
			{ label: valueToLabel ("respect_strong_etag"), value: "respect_strong_etag" },
			{ label: valueToLabel ("response_buffering"), value: "response_buffering" },
			{ label: valueToLabel ("rocket_loader"), value: "rocket_loader" },
			{ label: valueToLabel ("security_level"), value: "security_level" },
			{ label: valueToLabel ("server_side_exclude"), value: "server_side_exclude" },
			{ label: valueToLabel ("ssl"), value: "ssl" },
			{ label: valueToLabel ("true_client_ip_header"), value: "true_client_ip_header" },
			{ label: valueToLabel ("waf"), value: "waf" },
		]).addClass ("dynamic-trigger").val ( values.length > 0 ? values [ 0 ] : "pick_a_setting" ) )
		.append (
			$(`<div data-dynamic-wrapper="always_online" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="minify" >`)
				.append (`<label class="text" >HTML</label>`)
				.append ( modal.createSwitch ("html") )
				.append (`<label class="text" >CSS</label>`)
				.append ( modal.createSwitch ("css") )
				.append (`<label class="text" >JS</label>`)
				.append ( modal.createSwitch ("js") )
		)
		.append (
			$(`<div data-dynamic-wrapper="browser_cache_ttl" >`).html ( modal.createSelect ( "value", [
				{ label: "Enable Browser Cache TTL", value: "", selected: true, disabled: true },
				{ label: "30 minutes", value: 1800 },
				{ label: "an hour", value: 3600 },
				{ label: "2 hours", value: 7200 },
				{ label: "3 hours", value: 10800 },
				{ label: "4 hours", value: 14400 },
				{ label: "5 hours", value: 18000 },
				{ label: "8 hours", value: 28800 },
				{ label: "12 hours", value: 43200 },
				{ label: "16 hours", value: 57600 },
				{ label: "20 hours", value: 72000 },
				{ label: "a day", value: 86400 },
				{ label: "2 days", value: 172800 },
				{ label: "3 days", value: 259200 },
				{ label: "4 days", value: 345600 },
				{ label: "5 days", value: 432000 },
				{ label: "8 days", value: 691200 },
				{ label: "16 days", value: 1382400 },
				{ label: "24 days", value: 2073600 },
				{ label: "a month", value: 2678400 },
				{ label: "2 months", value: 5356800 },
				{ label: "6 months", value: 16070400 },
				{ label: "a year", value: 31536000 }
			]))
		)
		.append (
			$(`<div data-dynamic-wrapper="browser_check" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="bypass_cache_on_cookie" >`).append ( modal.createInput ( "text", "value", "Enter Value" ) )
		)
		.append (
			$(`<div data-dynamic-wrapper="cache_by_device_type" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="cache_deception_armor" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="cache_level" >`).append ( modal.createSelect ( "value", [
				{ label: "Select Cache Level", value: "", disabled: true, selected: true },
				{ label: "Bypass", value: "bypass" },
				{ label: "No Query String", value: "basic" },
				{ label: "Ignore Query String", value: "simplified" },
				{ label: "Standard", value: "aggressive" },
				{ label: "Cache Everything", value: "cache_everything" }
			]))
		)
		.append (
			$(`<div data-dynamic-wrapper="cache_on_cookie" >`).append ( modal.createInput ( "text", "value", "Enter Value" ) )
		)
		.append (
			$(`<div data-dynamic-wrapper="disable_apps" >`).html ("<p>Apps are disabled</p>")
		)
		.append (
			$(`<div data-dynamic-wrapper="disable_performance" >`).html ("<p>Performance is disabled</p>")
		)
		.append (
			$(`<div data-dynamic-wrapper="disable_security" >`).html ("<p>Security is disabled</p>")
		)
		.append (
			$(`<div data-dynamic-wrapper="edge_cache_ttl" >`).html ( modal.createSelect ( "value", [
				{ label: "Enter Edge Cache TTL", value: "", selected: true, disabled: true },
				{ label: "2 hours", value: 7200 },
				{ label: "3 hours", value: 10800 },
				{ label: "4 hours", value: 14400 },
				{ label: "5 hours", value: 18000 },
				{ label: "8 hours", value: 28800 },
				{ label: "12 hours", value: 43200 },
				{ label: "16 hours", value: 57600 },
				{ label: "20 hours", value: 72000 },
				{ label: "a day", value: 86400 },
				{ label: "2 days", value: 172800 },
				{ label: "3 days", value: 259200 },
				{ label: "4 days", value: 345600 },
				{ label: "5 days", value: 432000 },
				{ label: "6 days", value: 518400 },
				{ label: "7 days", value: 604800 },
				{ label: "14 days", value: 1209600 },
				{ label: "a month", value: 2419200 }
			]))
		)
		.append (
			$(`<div data-dynamic-wrapper="email_obfuscation" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="forwarding_url" >`)
				.html ( modal.createSelect ( "status_code", [
					{ label: "Select Status Code", value: "", disabled: true, selected: true },
					{ label: "301 - Permanent Redirect", value: 301 },
					{ label: "302 - Temporary Redirect", value: 302 }
				]))
				.append ( modal.createInput ( "text", "url", "Enter destination URL" ) )
		)
		.append (
			$(`<div data-dynamic-wrapper="host_header_override" >`).append ( modal.createInput ( "text", "value", "Enter Value" ) )
		)
		.append (
			$(`<div data-dynamic-wrapper="ip_geolocation" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="mirage" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="explicit_cache_control" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="origin_error_page_pass_thru" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="polish" >`).append (
				modal.createSelect ( "value", [
					{ label: "Select Value", value: "", disabled: true, selected: true },
					{ label: "Off", value: "off" },
					{ label: "Lossless", value: "lossless" },
					{ label: "Lossy", value: "lossy" }
				])
			)
		)
		.append (
			$(`<div data-dynamic-wrapper="sort_query_string_for_cache" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="resolve_override" >`).append ( modal.createInput ( "text", "value", "Enter Value" ) )
		)
		.append (
			$(`<div data-dynamic-wrapper="respect_strong_etag" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="response_buffering" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="rocket_loader" >`).append (
				modal.createSwitch ("value")
			)
		)
		.append (
			$(`<div data-dynamic-wrapper="security_level" >`).html ( modal.createSelect ( "value", [
				{ label: "Select Security Level", value: "", disabled: true, selected: true },
				{ label: "Essentially Off", value: "essentially_off" },
				{ label: "Low", value: "low" },
				{ label: "Medium", value: "medium" },
				{ label: "High", value: "high" },
				{ label: "I'm Under Attack", value: "under_attack" }
			]))
		)
		.append (
			$(`<div data-dynamic-wrapper="server_side_exclude" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="ssl" >`).html ( modal.createSelect ( "value", [
				{ label: "Select SSL Setting", value: "", disabled: true, selected: true },
				{ label: "Off", value: "off" },
				{ label: "Flexible", value: "flexible" },
				{ label: "Full", value: "full" },
				{ label: "Strict", value: "strict" }
			]))
		)
		.append (
			$(`<div data-dynamic-wrapper="true_client_ip_header" >`).append ( modal.createSwitch ("value") )
		)
		.append (
			$(`<div data-dynamic-wrapper="waf" >`).append ( modal.createSwitch ("value") )
		)
		.append ( close.click ( () => { $(close).parent ().remove () } ) )
	if ( values.length > 0 ) {
		$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).addClass ("active")
		if ( values.length > 1 ) {
			let target = $(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("input,[name='value']")
			let value = values [1]
			if ( values [0] == "forwarding_url" ) {
				$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("[name='status_code']").val ( values [ 1 ] )
				$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("[name='url']").val ( values [ 2 ] )
			}
			else if ( values [0] == "minify" ) {
				$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("[name='html']")
					.prop ( "checked", values [ 1 ].html == "on" )
				$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("[name='css']")
					.prop ( "checked", values [ 1 ].css == "on" )
				$(row).find (`[data-dynamic-wrapper="${values[0]}"]`).find ("[name='js']")
					.prop ( "checked", values [ 1 ].js == "on" )
			}
			else if ( ( value == "on" || value == "off" ) && values[0] != "ssl" && values[0] != "rocket_loader" ) {
				$(target).prop ( "checked", value == "on" )
			}
			else {
				$(target).val ( value )
			}
		}
	}
	return row
}

$(document).on ( "cloudflare.page_rules.page_rules.initialize", function ( event, data ) {
	let rulesUsed = data.response.result.length
	let rulesAllowed = data.response.entitlements.allocation.value
	if ( rulesUsed < rulesAllowed ) {
		$(data.section).find ("#rules_left").text ( rulesAllowed - rulesUsed )
		$(data.section).find ("#action")
			.addClass ("trigger")
			.val ("Create Page Rule")
			.off ( "click" )
	}
	else {
		$(data.section).find ("#rules_left").text ("0")
		$(data.section).find ("#action")
			.removeClass ("trigger")
			.val ("Buy More Page Rules")
			.on ( "click", () => {
				window.open ( "https://support.cloudflare.com/hc/en-us/articles/225894428-How-To-Buy-Additional-Page-Rules", "_blank" )
			})
	}
	var table = $(data.section).find ("table.rules")
	$(table).find ("tbody > tr").remove ()
	$(data.section).data ( "rules", data.response.result )
	if ( data.response.result.length > 0 ) {
		data.response.result
		.sort ( ( a, b ) => {
			return b.priority - a.priority
		})
		.map ( ( rule, index ) => {
			$(table).find ("tbody").append ( $("<tr>")
				.data ( "rule", rule )
				.append ( $("<td class='handle' >").html ("&#xF000; &#xF001;") )
				.append ( $("<td>").text ( index + 1 ).css ( "min-width", "initial" ) )
				.append (
					$("<td class='no_white_space' >")
						.text ( rule.targets [ 0 ].constraint.value )
						.append ( $("<span>").text (
							rule.actions.map ( i => {
								let id = valueToLabel ( i.id )
								let value = ""
								if ( i.value && i.value instanceof Object ) {
									value = ": ("
									let delim = ""
									for ( let key in i.value ) {
										value += delim + valueToLabel ( key ) + ": " + i.value [ key ]
										delim = ", "
									}
									value += ")"
								}
								else if ( i.value ) {
									value = ": " + upperCaseFirst ( i.value )
								}
								let string = id + value
								return string
							}).join (", ")
						))
				)
				.append ( $("<td>")
					.append (( () => {
						var element = modal.createSwitch ( "status", rule.status == "active" )
						$(element).find ("input")
							.addClass ("trigger")
							.data ( "target", "toggle" )
							.data ( "id", rule.id )
						return element
					}) () )
					.append (
						modal.createIconButton ( "edit", "&#xF019;" )
							.addClass ("trigger")
							.data ( "target", "edit" )
							.data ( "data", rule )
							.css ( "display", "inline-block" )
					)
					.append (
						modal.createIconButton ( "delete", "&#xF01A;" )
							.addClass ("trigger")
							.data ( "target", "delete" )
							.data ( "id", rule.id )
							.css ( "display", "inline-block" )
					)
				)
			)
		})
		$(table).find ("tbody").sortable ({
			handle: ".handle",
			helper: ( e, ui ) => {
				ui.children ().each ( () => {
					$(this).width ( $(this).width () )
				})
				return ui
			},
			stop: ( e, ui ) => {
				ui.item.parent ().find ("tr").each ( ( i, e ) => {
					$( e ).find ("td").eq ( 1 ).text ( i + 1 )
				})
				var priorities = $(table)
					.find ("tbody > tr")
					.toArray ()
					.reverse ()
					.map ( ( rule, index ) => {
						let data = $(rule).data ("rule")
						return {
							id: data.id,
							priority: index + 1
						}
					})
				$.ajax ({
					url: $(data.section).data ("endpoint").replace ( /(cloudflare\/[^\/]+\/)(index)?(.*)$/, "$1priority$3" ),
					type: "POST",
					data: {
						"form_key": $(data.section).data ("form-key"),
						"priorities": priorities
					},
					success: function ( response ) {
						notification.showMessages ( response )
					}
				})
			}
		})
	}
	else {
		$(table).find ("tbody").append (
			$("<tr>").append (
				$("<td colspan='6' >").text ("You do not have any Page Rules yet. Click 'Create Page Rule' above to get started.")
			)
		)
	}
})

$(document).on ( "cloudflare.page_rules.page_rules.toggle", function ( event, data ) {
	var id = data.trigger.data ("id")
	var state = $(data.trigger).is (":checked")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "state": state, "id": id },
		success: function ( response ) {
			$(data.section).removeClass ("loading")
			notification.showMessages ( response )
		}
	})
})

$(document).on ( "cloudflare.page_rules.page_rules.delete", function ( event, data ) {
	var confirm = new modal.Modal ()
	confirm.addTitle ("Confirm")
	confirm.addElement ( $("<p>").text ("Are you sure you want to delete this page rule?") )
	confirm.addButton ({ label: "OK", callback: ( components ) => {
		confirm.close ()
		var id = data.trigger.data ("id")
		$(data.section).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": id },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".page_rules")
			}
		})
	}})
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.show ()
})

$(document).on ( "cloudflare.page_rules.page_rules.edit", function ( event, data ) {
	var response = $(data.trigger).data ("data")
	var that = this
	var confirm = new modal.Modal ( 800 )
	var collections = $(`<div class="collections" >`)
	confirm.addTitle ( "Edit Page Rule for " + global.getDomainName (), $(this).val () )
	confirm.addRow (
		$(`<p>`)
			.append ( $(`<strong>`).text ("If the URL matches: ") )
			.append ( "By using the asterisk (*) character, you can create dynamic patterns that can match many URLs, rather than just one. " )
			.append ( $(`<a href="https://support.cloudflare.com/hc/en-us/articles/218411427" target="_blank" >`).text ("Learn more here") ),
		modal.createInput ( "text", "target", "Example: www.example.com/*" ).val ( response.targets [0].constraint.value ),
		true
	)
	response.actions.map ( action => {
		var values = [ action.value ]
		if ( action.id == "forwarding_url" ) {
			values = [ action.value.status_code, action.value.url ]
		}
		collections.append ( createRow ( false, [ action.id ].concat ( values ) ) )
	})
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Then the settings are:") ),
		[
			collections,
			$(`<a class="dashed" >`).text ("+ Add a Setting").click ( () => {
				var previousExists = $(collections).find (".collection").length > 0
				$(collections).append ( createRow ( previousExists ) )
			})
		],
		true
	)
	var saveCallback = ( components, status ) => {
		var target = $(components.container).find ("[name='target']").val ()
		var actions = $.makeArray ( $( components.container )
			.find (".collections > .collection")
			.map ( ( i, e ) => {
				var id = $(e).find ("[name='setting']").val ()
				var value = $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='value']").eq ( 0 )
				value = $(value).is (":checkbox") ? ( $(value).is (":checked") ? "on" : "off" ) : $(value).val ()
				if ( id == "forwarding_url" ) value = {
					url: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='url']").eq ( 0 ).val (),
					status_code: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='status_code']").eq ( 0 ).val ()
				}
				if ( id == "minify" ) value = {
					html: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='html']").eq ( 0 ).is (":checked") ? "on" : "off",
					css: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='css']").eq ( 0 ).is (":checked") ? "on" : "off",
					js: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='js']").eq ( 0 ).is (":checked") ? "on" : "off"
				}
				return { id, value }
			}))
		$(components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"target": target,
				"actions": actions,
				"status": status,
				"id": response.id
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".page_rules")
				}
				else {
					$(components.modal).removeClass ("loading")
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save as Draft", class: "gray", callback: ( components ) => { saveCallback ( components, false ) } })
	confirm.addButton ({ label: "Save and Deploy", callback: ( components ) => { saveCallback ( components, true ) } })
	confirm.show ()
})

$(document).on ( "cloudflare.page_rules.page_rules.create", function ( event, data ) {
	var section = data.section
	var that = this
	var confirm = new modal.Modal ( 800 )
	var collections = $(`<div class="collections" >`)
	confirm.addTitle ( "Create a Page Rule for " + global.getDomainName (), $(this).val () )
	confirm.addRow (
		$(`<p>`)
			.append ( $(`<strong>`).text ("If the URL matches: ") )
			.append ( "By using the asterisk (*) character, you can create dynamic patterns that can match many URLs, rather than just one. " )
			.append ( $(`<a href="https://support.cloudflare.com/hc/en-us/articles/218411427" target="_blank" >`).text ("Learn more here") ),
		modal.createInput ( "text", "target", "Example: www.example.com/*" ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Then the settings are:") ),
		[
			collections.append ( createRow () ),
			$(`<a class="dashed" >`).text ("+ Add a Setting").click ( () => {
				var previousExists = $(collections).find (".collection").length > 0
				$(collections).append ( createRow ( previousExists ) )
			})
		],
		true
	)
	if ( $(section).data ("rules").length > 0 ) {
		var customOptions = $(section).data ("rules")
			.sort ( ( a, b ) => { return b.priority - a.priority } )
			.map ( rule => {
				return {
					label: rule.targets [ 0 ].constraint.value,
					value: rule.priority
				}
			})
		customOptions = [{ label: "Select which Page Rule this will fire after", value: 1, selected: true, disabled: true }].concat ( customOptions )
		confirm.addRow (
			$(`<p>`)
				.append ( $(`<strong>`).text ("Order: ") )
				.append ("This is the order in which your Page Rules will be triggered. Only one Page Rule will trigger per URL, so put your most specific Page Rules at the top."),
			[
				modal.createSelect ( "order", [
					{ label: "First", value: "first", selected: true },
					{ label: "Last", value: "last" },
					{ label: "Custom", value: "custom" }
				]).on ( "change", ( event ) => {
					if ( $(event.target).val () === "custom" ) {
						$(event.target).next ().show ()
					}
					else {
						$(event.target).next ().hide ()
					}
				}),
				modal.createSelect ( "custom", customOptions ).hide ()
			],
			true
		)
	}
	var saveCallback = ( components, status ) => {
		var target = $(components.container).find ("[name='target']").val ()
		var actions = $.makeArray ( $( components.container )
			.find (".collections > .collection")
			.map ( ( i, e ) => {
				var id = $(e).find ("[name='setting']").val ()
				var value = $(components.container).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='value']").eq ( 0 )
				value = $(value).is (":checkbox") ? ( $(value).is (":checked") ? "on" : "off" ) : $(value).val ()
				if ( id == "forwarding_url" ) value = {
					url: $(components.container).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='url']").eq ( 0 ).val (),
					status_code: $(components.container).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='status_code']").eq ( 0 ).val ()
				}
				if ( id == "minify" ) value = {
					html: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='html']").eq ( 0 ).val (),
					css: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='css']").eq ( 0 ).val (),
					js: $(e).find ("[data-dynamic-wrapper='" + id + "']").find ("[name='js']").eq ( 0 ).val ()
				}
				return { id, value }
			}))
		$(components.modal).addClass ("loading")
		let getPriority = () => {
			var priority = 1
			if ( $(section).data ("rules").length > 0 ) {
				let order = $(components.container).find ("[name='order']").val ()
				if ( order === "custom" ) {
					priority = $(components.container).find ("[name='custom']").val ()
				}
				else if ( order == "last" ) {
					priority = $(section).data ("rules").length + 1
				}
			}
			return priority
		}
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"target": target,
				"actions": actions,
				"status": status,
				"priority": getPriority ()
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".page_rules")
				}
				else {
					$(components.modal).removeClass ("loading")
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save as Draft", class: "gray", callback: ( components ) => { saveCallback ( components, false ) } })
	confirm.addButton ({ label: "Save and Deploy", callback: ( components ) => { saveCallback ( components, true ) } })
	confirm.show ()
})

$(document).on ( "change", ".cloudflare_modal .collection [name='setting']", function () {
	if ( $(this).val () == "forwarding_url" ) {
		$(".cloudflare_modal a.dashed").hide ()
	}
	else {
		$(".cloudflare_modal a.dashed").show ()
	}
})

export default (window.$ = window.jQuery = $)
