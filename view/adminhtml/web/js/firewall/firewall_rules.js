const $ = jQuery = jquery = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")

function filterResults ( term, status, action, results ) {
	let searchTerm = ( term + "" ).toLowerCase ().trim ()
	return results.filter ( entry => {
		return true 
			&& ( entry.description + "" ).toLowerCase ().indexOf ( searchTerm ) > -1
			&& ( status == "all" || entry.paused == (status == "paused") )
			&& ( action == "all" || entry.action == action )
	})
}

function actionValueToLabel ( value ) {
	switch ( value ) {
		case "managed_challenge": return "Managed Challenge" 
		case "block": return "Block" 
		case "js_challenge": return "JS Challenge" 
		case "allow": return "Allow" 
		case "bypass": return "Bypass" 
		case "log": return "Log" 
		case "challenge": return "Legacy CAPTCHA" 
		default: return "Unknown"
	}
}

function featureValueToLabel ( value ) {
	switch ( value ) {
		case "uaBlock": return "User-Agent Blocking" 
		case "bic": return "Browser Integrity Check" 
		case "hot": return "Hotlink Protection" 
		case "securityLevel": return "Security Level" 
		case "rateLimit": return "Rate Limiting" 
		case "zoneLockdown": return "Zone Lockdown" 
		case "waf": return "WAF Managed Rules" 
		default: return "Unknown"
	}
}

function populateResult ( section ) {
	let results = $(section).data ("result") || []
	results = filterResults (
		$(section).find (".search").val (),
		$(section).find (".status").val (),
		$(section).find (".action").val (),
		results,
	)
	let table = $(section).find ("table > tbody")
	$(section).data ( "item-count", results.length )
	let itemCount = $(section).data ("item-count")
	let page = $(section).data ("page")
	let pageSize = $(section).data ("page-size")
	let pageCount = Math.ceil ( itemCount / pageSize )
	let from = pageSize * ( page - 1 ) + 1
	if ( itemCount == 0 ) from = 0
	let to = Math.min ( pageSize * page, itemCount )
	$(section).find (".pagination_container .pages").html ("")
	$(section).find (".pagination_container .showing").html (`${from} - ${to} of ${itemCount} rules`)
	let pages = $(section).find (".pagination_container .pages")
	let createPage = ( number ) => {
		return $(`<span class="page" >`)
			.addClass ( number == page ? "" : "trigger" )
			.addClass ( number == page ? "current" : "" )
			.data ( "target", "page" )
			.data ( "page", number )
			.text ( number )
	}
	if ( pageCount > 7 ) {
		$(pages).append ( createPage ( 1 ) )
		if ( pageCount > 7 && page > 4 ) {
			$(pages).append ( $(`<span>`).text ("...") )
		}
		let start = Math.max ( 2, page - 3 )
		let end = Math.min ( pageCount - 1, page + 3 )
		if ( page - 4 < 0 ) end += Math.abs ( page - 4 )
		if ( page + 3 > pageCount ) start -= page + 3 - pageCount
		if ( pageCount <= 7 && page < 4 ) end -= 1
		if ( pageCount <= 7 && page > 4 ) start += 1
		for ( let i = start; i <= end; i++ ) {
			$(pages).append ( createPage ( i ) )
		}
		if ( pageCount > 7 && page < pageCount - 3 ) {
			$(pages).append ( $(`<span>`).text ("...") )
		}
		$(pages).append ( createPage ( pageCount ) )
	}
	else {
		for ( let i = 1; i <= pageCount; i++ ) {
			$(pages).append ( createPage ( i ) )
		}
	}
	if ( page == 1 ) {
		$(section).find (".previous").addClass ("disabled")
	}
	else {
		$(section).find (".previous").removeClass ("disabled")
	}
	if ( page == pageCount ) {
		$(section).find (".next").addClass ("disabled")
	}
	else {
		$(section).find (".next").removeClass ("disabled")
	}
	$(table).html ("")
	for ( let i = 0; i < results.length; i++ ) {
		if ( i >= ( page - 1 ) * pageSize && i < page * pageSize ) {
			let entry = results [ i ]
			$(table).append ( $(`<tr>`)
				.append ( $(`<td>`).text ( entry.priority ) )
				.append ( $(`<td>`).text ( actionValueToLabel ( entry.action ) ) )
				.append ( $(`<td>`).text ( entry.description ).css ( "width", "100%" ) )
				.append ( $(`<td>`).css ( "display", "flex" )
					.append (( () => {
						var element = modal.createSwitch ( "status", !entry.paused )
						$(element).find ("input")
							.addClass ("trigger")
							.data ( "target", "toggle" )
							.data ( "id", entry.id )
							.data ( "entry", entry )
							.data ( "paused", !entry.paused )
						return element
					}) () )
					.append ( modal.createIconButton ( "trigger update", "&#xF019;" )
						.data ( "id", entry.id )
						.data ( "entry", entry )
						.data ( "target", "update" )
					)
					.append ( modal.createIconButton ( "trigger delete", "&#xF01A;" )
						.data ( "id", entry.id )
						.data ( "target", "delete" )
					)
				)
			)
		}
	}
	if ( results.length == 0 ) {
		$(table).append ( $("<tr>").append ( $("<td colspan='4' >").text ("No Firewall Rules") ) )
	}
}

$(document).on ( "cloudflare.firewall.firewall_rules.initialize", function ( event, data ) {
	let used = data.response.usage.used
	let available = data.response.usage.max
	$(data.section).find (".usage-used").text ( used )
	$(data.section).find (".usage-total").text ( available )
	$(data.section).data ( "result", data.response.result )
	populateResult ( data.section )
	$(data.section).removeClass ("loading")
})

$(document).on ( "cloudflare.firewall.firewall_rules.search", function ( event, data ) {
	$(data.section).data ( "page", 1 )
	let table = $(data.section).find ("table > tbody")
	$(table).children ().remove ()
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.firewall_rules.create", function ( event, data ) {
	var confirm = new modal.Modal ( 800 )
	confirm.addTitle ( "Create Firewall Rule", $(this).val () )
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Rule name (required)") ),
		modal.createInput ( "text", "name", "Give your rule a descriptive name" ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("When incoming requests match…") ),
		modal.createTextarea ( "expression", `For example: ip.src == 66.249.66.1`, "" ),
		true
	)
	const actionSelect = modal.createSelect ( "action", [
		{ label: actionValueToLabel ("managed_challenge"), value: "managed_challenge", selected: true },
		{ label: actionValueToLabel ("block"), value: "block" },
		{ label: actionValueToLabel ("js_challenge"), value: "js_challenge" },
		{ label: actionValueToLabel ("allow"), value: "allow" },
		{ label: actionValueToLabel ("bypass"), value: "bypass" },
		{ label: actionValueToLabel ("log"), value: "log" },
		{ label: actionValueToLabel ("challenge"), value: "challenge" },
	])
	const productsSelect = modal.createSelect ( "products", [
		{ label: featureValueToLabel ("zoneLockdown"), value: "zoneLockdown", selected: true },
		{ label: featureValueToLabel ("uaBlock"), value: "uaBlock" },
		{ label: featureValueToLabel ("bic"), value: "bic" },
		{ label: featureValueToLabel ("hot"), value: "hot" },
		{ label: featureValueToLabel ("securityLevel"), value: "securityLevel" },
		{ label: featureValueToLabel ("rateLimit"), value: "rateLimit" },
		{ label: featureValueToLabel ("waf"), value: "waf" },
	], true )
	$(productsSelect).css ({ height: "150px" })
	const productColumn = $(`<div>`)
		.append ( $(`<span>`).text ("Choose a feature (Required)") )
		.append ( productsSelect )
		.css ({ paddingRight: "5px", width: "100%" })
		.hide ()
	$(actionSelect).on ("change", event => event.target.value == "bypass" ? productColumn.show () : productColumn.hide () )
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Then…") ),
		$(`<p>`).append (
			$(`<div>`)
				.append ( $(`<span>`).text ("Choose an action (Required)") )
				.append ( actionSelect )
				.css ({ paddingRight: "5px", width: "100%" }),
			productColumn,
			$(`<div>`)
				.append ( $(`<span>`).text ("Priority (Optional)") )
				.append ( modal.createInput ( "number", "priority", "" ) )
				.css ({ paddingLeft: "5px", width: "100%" }),
		).css ({
			display: "flex",
			width: "100%",
		}),
		true
	)
	var saveCallback = ( components, paused ) => {
		var name = $(components.container).find ("[name='name']").val ()
		var expression = $(components.container).find ("[name='expression']").val ()
		var action = $(components.container).find ("[name='action']").val ()
		var priority = $(components.container).find ("[name='priority']").val ()
		var products = $(components.container).find ("[name='products']").val ()
		$(components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"name": name,
				"expression": expression,
				"action": action,
				"priority": priority,
				"products": action == "bypass" ? ( products || [] ) : [],
				"paused": paused,
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".firewall_rules")
				}
				else {
					$(components.modal).removeClass ("loading")
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save as Draft", class: "gray", callback: ( components ) => { saveCallback ( components, true ) } })
	confirm.addButton ({ label: "Deploy Firewall Rule", callback: ( components ) => { saveCallback ( components, false ) } })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.firewall_rules.delete", function ( event, data ) {
	var confirm = new modal.Modal ()
	confirm.addTitle ("Confirm")
	confirm.addElement ( $("<p>").text (`Are you sure you want to delete this rule?`) )
	confirm.addButton ({ label: "OK", callback: ( components ) => {
		confirm.close ()
		$(data.section).addClass ("loading")
		var id = $(data.trigger).data ("id")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": id },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".firewall_rules")
			}
		})
	}})
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.firewall_rules.toggle", function ( event, data ) {
	$(data.section).addClass ("loading")
	var entry = $(data.trigger).data ("entry")
	var paused = $(data.trigger).data ("paused")
	$.ajax ({
		url: data.form.endpoint.replace (/toggle/,"update"),
		type: "POST",
		data: {
			"form_key": data.form.key,
			"id": entry.id,
			"name": entry.description,
			"filterId": entry.filter.id,
			"filterExpression": entry.filter.expression,
			"action": entry.action,
			"priority": entry.priority,
			"paused": paused,
			"products": ( entry.products || [] ),
		},
		success: function ( response ) {
			notification.showMessages ( response )
			common.loadSections (".firewall_rules")
		}
	})
})

$(document).on ( "cloudflare.firewall.firewall_rules.update", function ( event, data ) {
	var confirm = new modal.Modal ( 800 )
	var entry = $(data.trigger).data ("entry")
	confirm.addTitle ( "Update Firewall Rule", $(this).val () )
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Rule name (required)") ),
		modal.createInput ( "text", "name", "Give your rule a descriptive name", entry.description ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("When incoming requests match…") ),
		modal.createTextarea ( "expression", `For example: ip.src == 66.249.66.1`, entry.filter.expression ),
		true
	)
	const actionSelect = modal.createSelect ( "action", [
		{ label: actionValueToLabel ("managed_challenge"), value: "managed_challenge", selected: entry.action == "managed_challenge" },
		{ label: actionValueToLabel ("block"), value: "block", selected: entry.action == "block" },
		{ label: actionValueToLabel ("js_challenge"), value: "js_challenge", selected: entry.action == "js_challenge" },
		{ label: actionValueToLabel ("allow"), value: "allow", selected: entry.action == "allow" },
		{ label: actionValueToLabel ("bypass"), value: "bypass", selected: entry.action == "bypass" },
		{ label: actionValueToLabel ("log"), value: "log", selected: entry.action == "log" },
		{ label: actionValueToLabel ("challenge"), value: "challenge", selected: entry.action == "challenge" },
	])
	const productsSelect = modal.createSelect ( "products", [
		{ label: featureValueToLabel ("zoneLockdown"), value: "zoneLockdown", selected: ( entry.products || [] ).includes ("zoneLockdown") },
		{ label: featureValueToLabel ("uaBlock"), value: "uaBlock", selected: ( entry.products || [] ).includes ("uaBlock") },
		{ label: featureValueToLabel ("bic"), value: "bic", selected: ( entry.products || [] ).includes ("bic") },
		{ label: featureValueToLabel ("hot"), value: "hot", selected: ( entry.products || [] ).includes ("hot") },
		{ label: featureValueToLabel ("securityLevel"), value: "securityLevel", selected: ( entry.products || [] ).includes ("securityLevel") },
		{ label: featureValueToLabel ("rateLimit"), value: "rateLimit", selected: ( entry.products || [] ).includes ("rateLimit") },
		{ label: featureValueToLabel ("waf"), value: "waf", selected: ( entry.products || [] ).includes ("waf") },
	], true )
	$(productsSelect).css ({ height: "150px" })
	const productColumn = $(`<div>`)
		.append ( $(`<span>`).text ("Choose a feature (Required)") )
		.append ( productsSelect )
		.css ({ paddingRight: "5px", width: "100%" })
	productColumn [ entry.action == "bypass" ? "show" : "hide" ] ()
	$(actionSelect).on ("change", event => event.target.value == "bypass" ? productColumn.show () : productColumn.hide () )
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Then…") ),
		$(`<p>`).append (
			$(`<div>`)
				.append ( $(`<span>`).text ("Choose an action (Required)") )
				.append ( actionSelect )
				.css ({ paddingRight: "5px", width: "100%" }),
			productColumn,
			$(`<div>`)
				.append ( $(`<span>`).text ("Priority (Optional)") )
				.append ( modal.createInput ( "number", "priority", "", entry.priority ) )
				.css ({ paddingLeft: "5px", width: "100%" }),
		).css ({
			display: "flex",
			width: "100%",
		}),
		true
	)
	var saveCallback = ( components, paused ) => {
		var name = $(components.container).find ("[name='name']").val ()
		var expression = $(components.container).find ("[name='expression']").val ()
		var action = $(components.container).find ("[name='action']").val ()
		var priority = $(components.container).find ("[name='priority']").val ()
		var products = $(components.container).find ("[name='products']").val ()
		$(components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"id": entry.id,
				"name": name,
				"filterId": entry.filter.id,
				"filterExpression": expression,
				"action": action,
				"priority": priority,
				"paused": paused,
				"products": action == "bypass" ? ( products || [] ) : [],
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".firewall_rules")
				}
				else {
					$(components.modal).removeClass ("loading")
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => { saveCallback ( components, false ) } })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.firewall_rules.page", function ( event, data ) {
	$(data.section).data ( "page", $(data.trigger).data ("page") )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.firewall_rules.next_page", function ( event, data ) {
	if ( $(data.section).data ("page") + 1 <= Math.ceil ( $(data.section).data ("item-count") / $(data.section).data ("page-size") ) ) {
		$(data.section).data ( "page", $(data.section).data ("page") + 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.firewall.firewall_rules.previous_page", function ( event, data ) {
	if ( $(data.section).data ("page") - 1 > 0 ) {
		$(data.section).data ( "page", $(data.section).data ("page") - 1 )
		populateResult ( data.section )
	}
})