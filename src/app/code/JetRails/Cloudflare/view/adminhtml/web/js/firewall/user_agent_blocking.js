const $ = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")

function populateResult ( section ) {
	let results = $(section).data ("result") || []
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
	let appended = 0
	for ( let i = 0; i < results.length; i++ ) {
		if ( i >= ( page - 1 ) * pageSize && i < page * pageSize ) {
			let entry = results [ i ]
			$(table).append ( createRow ( entry ) )
		}
	}
	if ( results.length == 0 ) {
		$(table).append ( $("<tr>").append ( $("<td colspan='2' >").text ("You currently have no User Agent Blocking rules. Please click on 'Create Blocking Rule' to get started.") ) )
	}
}

function createRow ( entry ) {
	let switchElement = modal.createSwitch ( "state", !entry.paused )
		.css ( "margin", "auto 15px auto 22px" )
	$(switchElement).find ("input")
		.addClass ("trigger")
		.data ( "target", "toggle" )
		.data ( "entry", entry )
	return $("<tr>")
		.append ( $("<td>")
			.append ( $("<b>").text ( entry.description ).css ({ "text-overflow": "ellipsis", "overflow": "hidden" }) )
			.append ( $("<span>").text ( entry.configuration.value ).css ({ "text-overflow": "ellipsis", "overflow": "hidden" }) )
			.css ({ "width": "100%", "max-width": "100px" })
		)
		.append ( $("<td>")
			.append ( modal.createSelect ( "mode", [
				{ "label": "Block", "value": "block" },
				{ "label": "Challenge", "value": "challenge" },
				{ "label": "JavaScript Challenge", "value": "js_challenge" }
				]).val ( entry.mode )
				.css ( "width", "auto" )
				.addClass ( "trigger-select" )
				.data ( "target", "mode" )
				.data ( "entry", entry )
			)
			.append ( switchElement )
			.append ( modal.createIconButton ( "trigger edit", "&#xF019;" )
				.css ( "display", "inline-block" )
				.addClass ("trigger")
				.data ( "target", "edit" )
				.data ( "entry", entry )
			)
			.append ( modal.createIconButton ( "trigger delete", "&#xF01A;" )
				.css ( "display", "inline-block" )
				.addClass ("trigger")
				.data ( "target", "delete" )
				.data ( "entry", entry )
			)
		)
}

function createModal ( name = false, action = false, agent = false ) {
	let prompt = new modal.Modal ( 600 )
	let nameElem = modal.createInput ( "text", "name", "Example: Block Internet Explorer 6 browsers", name ? name : "" )
	let agentElem = modal.createTextarea ( "agent", "Example: Mozilla/4.0 (compatible; MSIE 6.0; Windows NT 5.1; SV1)", agent ? agent : "" )
		.css ({ width: "100%", margin: 0 })
	let actionElem = modal.createSelect ( "mode", [
		{ "label": "Block", "value": "block", "selected": action === false || action == "block" },
		{ "label": "Challenge", "value": "challenge", "selected": action == "challenge" },
		{ "label": "JavaScript Challenge", "value": "js_challenge", "selected": action == "js_challenge" }
	])
	prompt.addTitle ( ( name === false ? "Create" : "Edit" ) + " a User Agent Blocking Rule" )
	prompt.addElement ( $("<p>").text ("Provide a description, an action, and a specific User Agent which you wish to configure.") )
	prompt.addRow ( "Name Description", nameElem, true )
	prompt.addRow ( "Action", actionElem, true )
	prompt.addRow ( "User Agent", agentElem, true )
	prompt.addButton ({ label: "Cancel", class: "gray", callback: prompt.close })
	prompt.show ()
	return prompt
}

$(document).on ( "cloudflare.firewall.user_agent_blocking.initialize", function ( event, data ) {
	let used = data.response.usage.used
	let available = data.response.usage.max
	let message = `You have ${used} of ${available} User Agent Blocking rules active`
	$(data.section).find (".usage").text ( message )
	$(data.section).data ( "result", data.response.result )
	$(data.section).data ( "used", used )
	$(data.section).data ( "available", available )
	populateResult ( data.section )
	$(data.section).removeClass ("loading")
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.create", function ( event, data ) {
	let used = (data.section).data ("used")
	let available = (data.section).data ("available")
	let prompt = createModal ()
	let create = ( paused ) => {
		let description = $(prompt.components.container).find ("[name='name']").val ()
		let mode = $(prompt.components.container).find ("[name='mode']").val ()
		let agent = $(prompt.components.container).find ("[name='agent']").val ()
		$(data.section).addClass ("loading")
		$(prompt.components.modal).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"mode": mode,
				"paused": paused,
				"description": description,
				"value": agent
			},
			success: function ( response ) {
				if ( response.success ) {
					$(prompt.components.modal).removeClass ("loading")
					prompt.close ()
				}
				notification.showMessages ( response )
				common.loadSections (".firewall.user_agent_blocking")
			}
		})
	}
	prompt.addButton ({ label: "Save as Draft", class: "gray", callback: () => create ( true ) })
	if ( used < available ) {
		prompt.addButton ({ label: "Save and Deploy", callback: () => create ( false ) })
	}
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.edit", function ( event, data ) {
	let entry = $(data.trigger).data ("entry")
	let prompt = createModal ( entry.description, entry.mode, entry.configuration.value )
	prompt.addButton ({ label: "Save", callback: () => {
		$(data.section).addClass ("loading")
		$(prompt.components.modal).addClass ("loading")
		let modal = $(prompt.components.modal)
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"id": entry.id,
				"mode": $(modal).find ("[name='mode']").val (),
				"paused": entry.paused,
				"description": $(modal).find ("[name='name']").val (),
				"value": $(modal).find ("[name='agent']").val ()
			},
			success: ( response ) => {
				if ( response.success ) {
					$(modal).removeClass ("loading")
					prompt.close ()
				}
				notification.showMessages ( response )
				common.loadSections (".firewall.user_agent_blocking")
			}
		})
	}})
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.delete", function ( event, data ) {
	let prompt = new modal.Modal ( 600 )
	let entry = $(data.trigger).data ("entry")
	prompt.addTitle ( "Please confirm that you would like to delete the following rule: <b>" + entry.description + "</b>" )
	prompt.addButton ({ label: "Cancel", class: "gray", callback: prompt.close })
	prompt.addButton ({ label: "Delete User Agent Rule", class: "red", callback: () => {
		$(data.section).addClass ("loading")
		prompt.close ()
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": entry.id },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".firewall.user_agent_blocking")
			}
		})
	}})
	prompt.show ()
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.mode", function ( event, data ) {
	let target = $(data.trigger)
	let entry = $(target).data ("entry")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"id": entry.id,
			"mode": target.val (),
			"paused": entry.paused,
			"value": entry.configuration.value,
			"description": entry.description
		},
		success: function ( response ) {
			notification.showMessages ( response )
			common.loadSections (".firewall.user_agent_blocking")
		}
	})
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.toggle", function ( event, data ) {
	let target = $(data.trigger)
	let entry = $(target).data ("entry")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"id": entry.id,
			"mode": entry.mode,
			"paused": !$(target).prop ("checked"),
			"value": entry.configuration.value,
			"description": entry.description
		},
		success: function ( response ) {
			notification.showMessages ( response )
			common.loadSections (".firewall.user_agent_blocking")
		}
	})
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.page", function ( event, data ) {
	$(data.section).data ( "page", $(data.trigger).data ("page") )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.next_page", function ( event, data ) {
	if ( $(data.section).data ("page") + 1 <= Math.ceil ( $(data.section).data ("item-count") / $(data.section).data ("page-size") ) ) {
		$(data.section).data ( "page", $(data.section).data ("page") + 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.firewall.user_agent_blocking.previous_page", function ( event, data ) {
	if ( $(data.section).data ("page") - 1 > 0 ) {
		$(data.section).data ( "page", $(data.section).data ("page") - 1 )
		populateResult ( data.section )
	}
})
