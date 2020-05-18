const $ = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")

function filterResults ( term, results ) {
	let searchTerm = ( term + "" ).toLowerCase ().trim ()
	return results.filter ( entry => {
		return ( entry.notes + "" ).toLowerCase ().indexOf ( searchTerm ) > -1
			|| ( entry.configuration.value + "" ).toLowerCase ().indexOf ( searchTerm ) > -1
	})
}

function sortResults ( section, results ) {
	let pivot = $(section).find (".sort-asc, .sort-desc")
	if ( pivot.length > 0 ) {
		let access = ( obj, path ) => {
			return path.reduce ( ( o, i ) => o [ i ], obj )
		}
		let attribute = $(pivot).data ("sort").split (".")
		let isAsc = $(pivot).hasClass ("sort-asc") === true
		results = results.sort ( ( a, b ) => {
			let aValue = (access ( a, attribute ) + "").toLowerCase ()
			let bValue = (access ( b, attribute ) + "").toLowerCase ()
			if ( isAsc ) {
				if ( aValue < bValue ) return -1
				if ( aValue > bValue ) return 1
				return 0
			}
			else {
				if ( aValue > bValue ) return -1
				if ( aValue < bValue ) return 1
				return 0
			}
		})
	}
	return results
}

function sortResults ( section, results ) {
	let pivot = $(section).find (".sort-asc, sort-desc")
	if ( pivot.length > 0 ) {
		let access = ( obj, path ) => {
			return path.reduce ( ( o, i ) => o [ i ], obj )
		}
		let attribute = $(pivot).data ("sort").split (".")
		results = results.sort ( ( a, b ) => {
			let aValue = (access ( a, attribute ) + "").toLowerCase ()
			let bValue = (access ( b, attribute ) + "").toLowerCase ()
			if ( $(pivot).hasClass ("sort-desc") ) {
				if ( aValue > bValue ) return -1
				if ( aValue < bValue ) return 1
				return 0
			}
			else {
				if ( aValue < bValue ) return -1
				if ( aValue > bValue ) return 1
				return 0
			}
		})
	}
	return results
}

function populateResult ( section ) {
	let results = $(section).data ("result") || []
	results = filterResults ( $(section).find (".search").val (), results )
	results = sortResults ( section, results )
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
			$(table).append ( $(`<tr>`)
				.append ( $(`<td>`)
					.text ( entry.configuration.value )
					.append ( $(`<span>`).text ( entry.notes ) )
					.css ({ width: "100%" })
				)
				.append ( $(`<td>`).text ("This website") )
				.append ( $(`<td>`).css ( "display", "flex" )
					.html ( modal.createSelect ( "mode", [
							{ "label": "Block", "value": "block", selected: entry.mode == "block" },
							{ "label": "Challenge", "value": "challenge", selected: entry.mode == "challenge" },
							{ "label": "Whitelist", "value": "whitelist", selected: entry.mode == "whitelist" },
							{ "label": "JavaScript Challenge", "value": "js_challenge", selected: entry.mode == "js_challenge" }
						])
						.css ({ minWidth: "200px" })
						.addClass ("trigger-select")
						.data ( "target", "mode" )
						.data ( "id", entry.id )
					)
					.append ( modal.createIconButton ( "trigger edit", "&#xF013;" )
						.data ( "id", entry.id )
						.data ( "note", entry.notes )
						.data ( "target", "edit" )
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
		$(table).append ( $("<tr>").append ( $("<td colspan='6' >").text ("No access rules found.") ) )
	}
}

$(document).on ( "cloudflare.firewall.access_rules.initialize", function ( event, data ) {
	$(data.section).data ( "result", data.response.result )
	populateResult ( data.section )
	$(data.section).removeClass ("loading")
})

$(document).on ( "cloudflare.firewall.access_rules.sort", function ( event, data ) {
	$(data.section).data ( "page", 1 )
	$(data.section).data ( "sort", $(data.trigger).data ("sort") )
	if ( $(data.trigger).hasClass ("sort-asc") ) {
		$(data.trigger).siblings ().removeClass ("sort-asc").removeClass ("sort-desc")
		$(data.trigger).removeClass ("sort-asc").addClass ("sort-desc")
		$(data.section).data ( "direction", "desc" )
	}
	else if ( $(data.trigger).hasClass ("sort-desc") ) {
		$(data.trigger).siblings ().removeClass ("sort-asc").removeClass ("sort-desc")
		$(data.trigger).removeClass ("sort-asc").removeClass ("sort-desc")
		$(data.section).data ( "direction", "" )
	}
	else {
		$(data.trigger).siblings ().removeClass ("sort-asc").removeClass ("sort-desc")
		$(data.trigger).addClass ("sort-asc")
		$(data.section).data ( "direction", "asc" )
	}
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.access_rules.search", function ( event, data ) {
	$(data.section).data ( "page", 1 )
	let table = $(data.section).find ("table > tbody")
	$(table).children ().remove ()
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.access_rules.add", function ( event, data ) {
	$(data.section).addClass ("loading")
	var value = $(data.section).find ("[name='value']").val ()
	var mode = $(data.section).find ("[name='mode']").val ()
	var note = $(data.section).find ("[name='note']").val ()
	var target = ""
	switch ( true ) {
		case /[0-9]+(?:\.[0-9]+){3}\/[0-9]+/.test ( value ):
			target = "ip_range"
			break
		case /[0-9]+(?:\.[0-9]+){3}/.test ( value ):
			target = "ip"
			break
		case /AS[0-9]+/.test ( value ):
			target = "asn"
			break
		default:
			target = "country"
	}
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"target": target,
			"value": value,
			"mode": mode,
			"note": note
		},
		success: function ( response ) {
			notification.showMessages ( response )
			$(data.section).addClass ("loading")
			$(data.section).find ("[name='value']").val ("")
			$(data.section).find ("[name='mode']").val ("block")
			$(data.section).find ("[name='note']").val ("")
			common.loadSections (".access_rules")
		}
	})
	common.loadSections (".access_rules")
})

$(document).on ( "cloudflare.firewall.access_rules.delete", function ( event, data ) {
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
				common.loadSections (".access_rules")
			}
		})
	}})
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.access_rules.mode", function ( event, data ) {
	$(data.section).addClass ("loading")
	var id = $(data.trigger).data ("id")
	var mode = $(data.trigger).val ()
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key, "id": id, "mode": mode },
		success: function ( response ) {
			notification.showMessages ( response )
			common.loadSections (".access_rules")
		}
	})
})

$(document).on ( "cloudflare.firewall.access_rules.edit", function ( event, data ) {
	let notes = modal.createTextarea ( "notes", "", $(data.trigger).data ("note") ).css ({
		margin: "22.5px 22.5px 0 22.5px",
		width: "calc(100% - 45px)",
		fontSize: "1.1em"
	})
	let edit = new modal.Modal ( 800 )
	edit.addTitle ("Edit notes")
	edit.addElement ( notes )
	edit.addButton ({ label: "Close", class: "gray", callback: edit.close })
	edit.addButton ({ label: "Save", callback: ( components ) => {
		edit.close ()
		$(data.section).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": $(data.trigger).data ("id"), "note": notes.val () },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".access_rules")
			}
		})
	}})
	edit.show ()
})

$(document).on ( "cloudflare.firewall.access_rules.page", function ( event, data ) {
	$(data.section).data ( "page", $(data.trigger).data ("page") )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.firewall.access_rules.next_page", function ( event, data ) {
	if ( $(data.section).data ("page") + 1 <= Math.ceil ( $(data.section).data ("item-count") / $(data.section).data ("page-size") ) ) {
		$(data.section).data ( "page", $(data.section).data ("page") + 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.firewall.access_rules.previous_page", function ( event, data ) {
	if ( $(data.section).data ("page") - 1 > 0 ) {
		$(data.section).data ( "page", $(data.section).data ("page") - 1 )
		populateResult ( data.section )
	}
})
