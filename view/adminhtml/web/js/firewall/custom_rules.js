const $ = jQuery = jquery = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")

const actions = [
	{ value: "managed_challenge", label: "Managed Challenge" },
	{ value: "block", label: "Block" },
	{ value: "js_challenge", label: "JS Challenge" },
	{ value: "skip", label: "Skip" },
	{ value: "challenge", label: "Interactive Challenge" },
	{ value: "log", label: "Log", hint: "Log (Enterprise only)" },
]

const skipPhases = [
	{ value: "http_ratelimit", label: "All rate limiting rules" },
	{ value: "http_request_firewall_managed", label: "All managed rules" },
	{ value: "http_request_sbfm", label: "All Super Bot Fight Mode rules" },
]

const skipProducts = [
	{ value: "zoneLockdown", label: "Zone Lockdown" },
	{ value: "uaBlock", label: "User Agent Blocking" },
	{ value: "bic", label: "Browser Integrity Check" },
	{ value: "hot", label: "Hotlink Protection" },
	{ value: "securityLevel", label: "Security Level" },
	{ value: "rateLimit", label: "Rate limiting rules (Previous version)" },
	{ value: "waf", label: "Managed rules (Previous version)" },
]

const responseTypes = [
	{ value: "", label: "Default Cloudflare WAF block page" },
	{ value: "text/html", label: "Custom HTML" },
	{ value: "text/plain", label: "Custom Text" },
	{ value: "application/json", label: "Custom JSON" },
	{ value: "text/xml", label: "Custom XML" },
]

function actionValueToLabel ( value ) {
	const action = actions.find ( action => action.value == value )
	return action ? action.label : value
}

function isFiltered ( section ) {
	return ( $(section).find (".search").val () + "" ).trim () !== ""
		|| $(section).find (".status").val () != "all"
		|| $(section).find (".action").val () != "all"
}

function filterResults ( term, status, action, results ) {
	let searchTerm = ( term + "" ).toLowerCase ().trim ()
	return results.filter ( entry => {
		return true
			&& ( entry.description || "" ).toLowerCase ().indexOf ( searchTerm ) > -1
			&& ( status == "all" || entry.enabled == ( status == "enabled" ) )
			&& ( action == "all" || entry.action == action )
	})
}

function truncate ( value, length ) {
	value = ( value || "" ) + ""
	return value.length > length ? value.substring ( 0, length ) + "..." : value
}

function savePosition ( section, row ) {
	let previous = $(row).prev ("tr").data ("entry")
	let next = $(row).next ("tr").data ("entry")
	if ( !previous && !next ) return
	$(section).addClass ("loading")
	$.ajax ({
		url: $(section).data ("endpoint").replace ( /(cloudflare\/[^\/]+\/)(index)?(.*)$/, "$1position$3" ),
		type: "POST",
		data: {
			"form_key": $(section).data ("form-key"),
			"id": $(row).data ("entry").id,
			"position": previous ? "after" : "before",
			"target": previous ? previous.id : next.id,
		},
		success: function ( response ) {
			if ( !response.success ) notification.showMessages ( response )
			common.loadSections (".custom_rules")
		}
	})
}

function populateResult ( section ) {
	let results = $(section).data ("result") || []
	results = filterResults (
		$(section).find (".search").val (),
		$(section).find (".status").val (),
		$(section).find (".action").val (),
		results,
	)
	let sortable = !isFiltered ( section ) && results.length > 1
	let table = $(section).find ("table > tbody")
	$(section).data ( "item-count", results.length )
	let itemCount = $(section).data ("item-count")
	let pageSize = $(section).data ("page-size")
	let pageCount = Math.ceil ( itemCount / pageSize )
	let page = Math.max ( 1, Math.min ( $(section).data ("page"), pageCount ) )
	$(section).data ( "page", page )
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
	if ( page >= pageCount ) {
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
				.data ( "entry", entry )
				.append ( $(`<td class="handle" >`).html ( sortable ? "&#xF000; &#xF001;" : "" ) )
				.append ( $(`<td>`).text ( entry.order ).css ( "min-width", "initial" ) )
				.append ( $(`<td>`).text ( actionValueToLabel ( entry.action ) ) )
				.append ( $(`<td class="no_white_space" >`)
					.text ( entry.description || "No name" )
					.append ( $(`<span>`).text ( truncate ( entry.expression, 120 ) ) )
				)
				.append ( $(`<td>`).append ( $(`<div>`).css ({ display: "flex", alignItems: "center" })
					.append (( () => {
						var element = modal.createSwitch ( "status", entry.enabled ).css ( "margin-top", 0 )
						$(element).find ("input")
							.addClass ("trigger")
							.data ( "target", "toggle" )
							.data ( "id", entry.id )
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
				))
			)
		}
	}
	if ( results.length == 0 ) {
		$(table).append ( $("<tr>").append ( $("<td colspan='5' >").text ("No Custom Rules") ) )
	}
	if ( $(table).sortable ("instance") ) {
		$(table).sortable ("destroy")
	}
	if ( sortable ) {
		$(table).sortable ({
			handle: ".handle",
			helper: ( e, ui ) => {
				ui.children ().each ( function () {
					$(this).width ( $(this).width () )
				})
				return ui
			},
			stop: ( e, ui ) => savePosition ( section, ui.item ),
		})
	}
}

function createCheckbox ( name, value, label, checked ) {
	return $(`<label>`)
		.css ({ display: "block", margin: "0 0 8px", cursor: "pointer" })
		.append ( $(`<input type="checkbox" >`).attr ( "name", name ).val ( value ).prop ( "checked", checked ) )
		.append ( $(`<span>`).text ( label ) )
}

function createColumn ( label, element, css = {} ) {
	return $(`<div>`)
		.append ( $(`<span>`).text ( label ) )
		.append ( element )
		.css ( Object.assign ({ width: "100%" }, css ) )
}

function addRow ( confirm, label, element ) {
	confirm.addRow ( $(`<p>`).append ( $(`<strong>`).text ( label ) ), element, true )
	return $(confirm.components.container).find ("> .row").last ()
}

function openRuleModal ( data, entry = null ) {
	const rules = $(data.section).data ("result") || []
	const params = ( entry && entry.action_parameters ) || {}
	const response = params.response || {}
	const confirm = new modal.Modal ( 800 )
	confirm.addTitle ( entry ? "Edit Custom Rule" : "Create Custom Rule" )
	addRow ( confirm, "Rule name (required)",
		modal.createInput ( "text", "name", "Give your rule a descriptive name" ).val ( entry ? entry.description : "" )
	)
	addRow ( confirm, "When incoming requests match…",
		modal.createTextarea ( "expression", `For example: (ip.src eq 203.0.113.1)`, entry ? entry.expression : "" )
	)
	const actionSelect = modal.createSelect ( "action", actions.map ( action => ({
		label: action.hint || action.label,
		value: action.value,
		selected: entry ? entry.action == action.value : action.value == "managed_challenge",
	})))
	addRow ( confirm, "Then take action…", createColumn ( "Choose an action (Required)", actionSelect ) )
	const contentType = modal.createSelect ( "content_type", responseTypes.map ( type => ({
		label: type.label,
		value: type.value,
		selected: ( response.content_type || "" ) == type.value,
	})))
	const statusCode = modal.createInput ( "number", "status_code", "403" )
		.attr ({ min: 400, max: 499 })
		.val ( response.status_code || 403 )
	const content = modal.createTextarea ( "content", "", response.content || "" )
	const statusColumn = createColumn ( "With response code (400 to 499)", statusCode, { paddingLeft: "5px" } )
	const contentColumn = createColumn ( "Response body", content, { marginTop: "10px" } )
	const blockRow = addRow ( confirm, "Block response (Pro plans and above)", $(`<div>`).css ({ width: "100%" }).append (
		$(`<div>`).css ({ display: "flex" }).append (
			createColumn ( "With response type", contentType, { paddingRight: "5px" } ),
			statusColumn,
		),
		contentColumn,
	))
	const skipRow = addRow ( confirm, "WAF components to skip (Required)", $(`<div>`).css ({ width: "100%" }).append (
		createCheckbox ( "skip_ruleset", "current", "All remaining custom rules", params.ruleset == "current" ),
		...skipPhases.map ( phase => createCheckbox ( "skip_phases", phase.value, phase.label, ( params.phases || [] ).includes ( phase.value ) ) ),
		$(`<p>`).css ({ margin: "12px 0 8px" }).append ( $(`<strong>`).text ("More components to skip") ),
		...skipProducts.map ( product => createCheckbox ( "skip_products", product.value, product.label, ( params.products || [] ).includes ( product.value ) ) ),
		$(`<p>`).css ({ margin: "12px 0 8px" }).append ( $(`<strong>`).text ("Log") ),
		createCheckbox ( "logging", "true", "Log matching requests", !entry || !entry.logging || entry.logging.enabled !== false ),
	))
	const others = rules.filter ( rule => !entry || rule.id != entry.id )
	if ( others.length > 0 ) {
		const orderSelect = modal.createSelect ( "order", [].concat (
			entry ? [{ label: "Keep current position", value: "current", selected: true }] : [],
			[
				{ label: "First", value: "first" },
				{ label: "Last", value: "last", selected: !entry },
				{ label: "Custom", value: "custom" },
			]
		))
		const customSelect = modal.createSelect ( "custom", [{ label: "Select which rule this will fire after", value: "", selected: true, disabled: true }].concat (
			others.map ( rule => ({ label: `${rule.order}. ${rule.description || rule.id}`, value: rule.id }) )
		)).hide ()
		$(orderSelect).on ( "change", () => $(orderSelect).val () == "custom" ? customSelect.show () : customSelect.hide () )
		addRow ( confirm, "Place at", [ orderSelect, customSelect ] )
	}
	const updateVisibility = () => {
		blockRow [ actionSelect.val () == "block" ? "show" : "hide" ] ()
		skipRow [ actionSelect.val () == "skip" ? "show" : "hide" ] ()
		statusColumn [ contentType.val () ? "show" : "hide" ] ()
		contentColumn [ contentType.val () ? "show" : "hide" ] ()
	}
	$(actionSelect).on ( "change", updateVisibility )
	$(contentType).on ( "change", updateVisibility )
	updateVisibility ()
	const save = ( components, enabled ) => {
		const find = name => $(components.container).find (`[name='${name}']`)
		const checked = name => find ( name ).filter (":checked").map ( ( i, e ) => $(e).val () ).get ()
		var action = find ("action").val ()
		var skipRuleset = find ("skip_ruleset").is (":checked")
		var skipPhases = checked ("skip_phases")
		var skipProducts = checked ("skip_products")
		var order = find ("order").val () || ""
		var target = order == "custom" ? ( find ("custom").val () || "" ) : ""
		if ( action == "skip" && !skipRuleset && skipPhases.length == 0 && skipProducts.length == 0 ) {
			return notification.addError ("Select at least one WAF component to skip")
		}
		if ( order == "custom" && target == "" ) {
			return notification.addError ("Select which rule this will fire after")
		}
		$(components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"id": entry ? entry.id : "",
				"name": find ("name").val (),
				"expression": find ("expression").val (),
				"action": action,
				"enabled": enabled,
				"skip_ruleset": skipRuleset,
				"skip_phases": skipPhases,
				"skip_products": skipProducts,
				"logging": find ("logging").is (":checked"),
				"content_type": find ("content_type").val (),
				"status_code": find ("status_code").val (),
				"content": find ("content").val (),
				"position": order == "custom" ? "after" : ( order == "current" ? "" : order ),
				"target": target,
			},
			success: function ( response ) {
				$(components.modal).removeClass ("loading")
				if ( response.success ) {
					confirm.close ()
					$(data.section).addClass ("loading")
					common.loadSections (".custom_rules")
				}
				else {
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	if ( entry ) {
		confirm.addButton ({ label: "Save", callback: ( components ) => save ( components, entry.enabled ) })
	}
	else {
		confirm.addButton ({ label: "Save as Draft", class: "gray", callback: ( components ) => save ( components, false ) })
		confirm.addButton ({ label: "Deploy", callback: ( components ) => save ( components, true ) })
	}
	confirm.show ()
}

$(document).on ( "cloudflare.firewall.custom_rules.initialize", function ( event, data ) {
	let rules = ( data.response.result && data.response.result.rules ) || []
	rules.forEach ( ( rule, index ) => rule.order = index + 1 )
	let usage = data.response.usage || { used: rules.length, max: null }
	$(data.section).find (".usage-used").text ( usage.used )
	$(data.section).find (".usage-total").text ( usage.max )
	$(data.section).find (".usage-limit") [ usage.max ? "show" : "hide" ] ()
	$(data.section).data ( "result", rules )
	populateResult ( data.section )
	$(data.section).removeClass ("loading")
})

$(document).on ( "cloudflare.firewall.custom_rules.search", function ( event, data ) {
	$(data.section).data ( "page", 1 )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.custom_rules.create", function ( event, data ) {
	openRuleModal ( data )
})

$(document).on ( "cloudflare.firewall.custom_rules.update", function ( event, data ) {
	openRuleModal ( data, $(data.trigger).data ("entry") )
})

$(document).on ( "cloudflare.firewall.custom_rules.delete", function ( event, data ) {
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
				if ( !response.success ) notification.showMessages ( response )
				common.loadSections (".custom_rules")
			}
		})
	}})
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.custom_rules.toggle", function ( event, data ) {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"id": $(data.trigger).data ("id"),
			"state": $(data.trigger).is (":checked"),
		},
		success: function ( response ) {
			if ( !response.success ) notification.showMessages ( response )
			common.loadSections (".custom_rules")
		}
	})
})

$(document).on ( "cloudflare.firewall.custom_rules.page", function ( event, data ) {
	$(data.section).data ( "page", $(data.trigger).data ("page") )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.custom_rules.next_page", function ( event, data ) {
	if ( $(data.section).data ("page") + 1 <= Math.ceil ( $(data.section).data ("item-count") / $(data.section).data ("page-size") ) ) {
		$(data.section).data ( "page", $(data.section).data ("page") + 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.firewall.custom_rules.previous_page", function ( event, data ) {
	if ( $(data.section).data ("page") - 1 > 0 ) {
		$(data.section).data ( "page", $(data.section).data ("page") - 1 )
		populateResult ( data.section )
	}
})
