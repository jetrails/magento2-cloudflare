const $ = jQuery = jquery = require ("jquery")
const common = require ("cloudflare/common")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")
const global = require ("cloudflare/global")

function createTtlSelect ( selected = "1" ) {
	let select = modal.createSelect ( "ttl_value", [
		{ label: secondsToAppropriate ( 1 ), value: 1 },
		{ label: secondsToAppropriate ( 120 ), value: 120 },
		{ label: secondsToAppropriate ( 300 ), value: 300 },
		{ label: secondsToAppropriate ( 600 ), value: 600 },
		{ label: secondsToAppropriate ( 900 ), value: 900 },
		{ label: secondsToAppropriate ( 1800 ), value: 1800 },
		{ label: secondsToAppropriate ( 3600 ), value: 3600 },
		{ label: secondsToAppropriate ( 7200 ), value: 7200 },
		{ label: secondsToAppropriate ( 18000 ), value: 18000 },
		{ label: secondsToAppropriate ( 43200 ), value: 43200 },
		{ label: secondsToAppropriate ( 86400 ), value: 86400 }
	])
	return select.val ( selected )
}

function secondsToAppropriate ( seconds ) {
	if ( seconds == 1 ) return "Automatic"
	if ( seconds < 60 ) return seconds + " seconds"
	if ( seconds == 60 ) return "1 minute"
	if ( seconds < 3600 ) return seconds / 60 + " minutes"
	if ( seconds == 3600 ) return "1 hour"
	if ( seconds < 216000 ) return seconds / 3600 + " hours"
	if ( seconds = 216000 ) return "1 day"
	return seconds / 216000 + " days"
}

function filterResults ( term, results ) {
	let searchTerm = ( term + "" ).toLowerCase ().trim ()
	return !results ? [] : results.filter ( entry => {
		return ( entry.name + "" ).toLowerCase ().indexOf ( searchTerm ) > -1 ||
			   ( entry.content + "" ).toLowerCase ().indexOf ( searchTerm ) > -1
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
			let aValue = ( access ( a, attribute ) + "").toLowerCase ()
			let bValue = ( access ( b, attribute ) + "").toLowerCase ()
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

function populateResult ( section ) {
	let results = $(section).data ("result")
	results = filterResults ( $(section).find (".search").val (), results )
	results = sortResults ( section, results )
	let table = $(section).find ("table > tbody")
	$(table).children ().remove ()
	$(section).data ( "item-count", results.length )
	let itemCount = $(section).data ("item-count")
	let page = $(section).data ("page")
	let pageSize = $(section).data ("page-size")
	let pageCount = Math.ceil ( itemCount / pageSize )
	let from = pageSize * ( page - 1 ) + 1
	if ( itemCount == 0 ) from = 0
	let to = Math.min ( pageSize * page, itemCount )
	$(section).find (".pagination_container .pages").html ("")
	$(section).find (".pagination_container .showing").html (`${from} - ${to} of ${itemCount} records`)
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
	const imageBase = global.getSkinBaseUrl ()
	for ( let i = 0; i < results.length; i++ ) {
		if ( i >= ( page - 1 ) * pageSize && i < page * pageSize ) {
			let entry = results [ i ]
			let formattedName = [ "CAA", "SRV" ].indexOf ( entry.type ) > -1 ? entry.name : entry.name.replace ( /\.[^.]+\.[^.]+$/, "" )
			var formattedContent = entry.content
			if ( entry.type == "SRV" ) {
				formattedName = formattedName.replace ( /\.$/, "" ) + "."
				formattedContent = `SRV ${entry.data.priority} ${entry.data.weight} ${entry.data.port} ${entry.data.target}.`
			}
			else if ( entry.type == "LOC" ) {
				formattedContent = "IN LOC " + entry.content.replace ( /(\d\.[0-9]*[1-9])0*|(\d)\.0+/g, "$1$2" )
			}
			var row = $("<tr>")
			$(row).data ( "entry", entry )
			$( row ).append ( $("<td>")
				.attr ( "class", "type type_" + entry.type.toLowerCase () )
				.text ( entry.type )
			)
			$( row ).append ( $("<td>")
				.attr ( "class", "name" )
				.html ( $("<div class='editable' contenteditable='true' >")
					.text ( formattedName )
					.attr ( "name", "content" )
					.addClass ( "show-form-" + entry.type.toLowerCase () + "-name" )
					.data ( "old", formattedName )
					.val ( formattedName )
				)
			)
			$( row ).append ( $("<td>")
				.attr ( "class", "value" )
				.html ( $("<div class='editable' contenteditable='true' >")
					.text ( formattedContent )
					.addClass ( "type_" + entry.type.toLowerCase () )
					.attr ( "name", "content" )
					.addClass ( "show-form-" + entry.type.toLowerCase () )
					.data ( "old", formattedContent )
					.val ( formattedContent )
				)
				.append ( entry.type == "MX" ? `<div class="priority" >${entry.priority}</div>` : "" )
			)
			$( row ).append ( $("<td>")
				.attr ( "class", "ttl" )
				.text ( secondsToAppropriate ( entry.ttl ) )
				.data ( "ttl", entry.ttl )
			)
			$( row ).append ( $("<td>")
				.attr ( "class", "status" )
				.html ( entry.proxiable ? entry.proxied ? "<img class='proxied change' src='" + imageBase + "/images/proxied_on.svg' />" : "<img class='proxied change' src='" + imageBase + "/images/proxied_off.svg' />" : "" )
			)
			$( row ).append ( $("<td>").attr ( "class", "delete" )
				.html ( $("<div class='trigger delete_entry cloudflare-font' >")
					.data ( "target", "delete" )
					.data ( "id", entry.id )
					.data ( "type", entry.type )
					.data ( "name", entry.name )
					.html ("&#xF01A;")
				)
			)
			row.appendTo ( table )
		}
	}
	if ( results.length == 0 ) {
		$(table).append ( $("<tr>").append ( $("<td colspan='6' >").text ("No DNS records found.") ) )
	}
}

$(document).on ( "cloudflare.dns.dns_records.initialize", function ( event, data ) {
	$(data.section).data ( "result", data.response.result )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.dns.dns_records.delete", function ( event, data ) {
	var id = $(data.trigger).data ("id")
	var type = $(data.trigger).data ("type").toUpperCase ()
	var name = $(data.trigger).data ("name")
	var confirm = new modal.Modal ()
	confirm.addTitle ("Confirm")
	confirm.addElement ( $("<p>").text (`Are you sure you want to delete the ${type} Record?`) )
	confirm.addElement ( $("<li>").append ( $("<strong>").text ( name ) ) )
	confirm.addButton ({ label: "OK", callback: ( components ) => {
		confirm.close ()
		$(data.section).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": id },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".dns_records")
			}
		})
	}})
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.show ()
})

$(document).on ( "cloudflare.dns.dns_records.create", function ( event, data ) {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: {
			"form_key": data.form.key,
			"type": $(data.section).find ("select.type").val (),
			"name": $(data.section).find ("div.active > input[name='name']").val (),
			"content": $(data.section).find ("div.active > input[name='content']").val (),
			"ttl": $(data.section).find ("select.ttl").val (),
			"proxied": $(data.section).find (".proxied.add").data ("value"),
			"priority": $(data.section).find (".priority.add").val ()
		},
		success: function ( response ) {
			$(data.section).removeClass ("loading")
			notification.showMessages ( response )
			if ( response.success ) {
				$(data.section).find ("[name='name'],[name='content']").val ("")
				$(data.section).addClass ("loading")
				common.loadSections (".dns.dns_records")
			}
		}
	})
})

$(document).on ( "cloudflare.dns.dns_records.search", function ( event, data ) {
	$(data.section).data ( "page", 1 )
	populateResult ( data.section )
})

$(document).on ( "focus", ".show-form-mx", function () {
	var confirm = new modal.Modal ()
	let oldPriority = parseInt ( $(document).find (".priority.add").val () ) || 1
	let oldValue = $(this).val ()
	if ( $(this).hasClass ("editable") ) {
		oldPriority = $(this).parent ().find (".priority").text ()
	}
	confirm.addTitle ( "Add Record: MX content", $(this).val () )
	confirm.addRow ( "Server", $("<input type='text' placeholder='Mail server' name='server' >").val ( oldValue ) )
	confirm.addRow ( "Priority", $("<input type='text' placeholder='1' name='priority' >").val ( oldPriority ) )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	var that = this
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var priority = $( components.container ).find ("input[name='priority']").val ()
		let newValue = $( components.container ).find ("input[name='server']").val ()
		if ( priority.trim () === "" ) priority = "1"
		$(document).find (".priority.add").val ( priority )
		$(that).data ( "priority", parseInt ( priority ) )
		$(that).parent ().find (".priority").text ( parseInt ( priority ) )
		$(that).val ( newValue ).text ( newValue )
		if ( $(this).hasClass ("editable") && ( oldPriority != parseInt ( priority ) ) || newValue != oldValue ) {
			let tempVal = $(that).val () + " "
			$(that).val ( tempVal ).text ( tempVal ).trigger ("change")
		}
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-loc", function () {
	var that = this
	var confirm = new modal.Modal ()
	var latitude = modal.createRows (
		modal.createRow ( "degrees", modal.createInput ( "text", "lat-degrees", "", "0" ) ),
		modal.createRow ( "minutes", modal.createInput ( "text", "lat-minutes", "", "0" ) ),
		modal.createRow ( "seconds", modal.createInput ( "text", "lat-seconds", "", "0" ) ),
		modal.createRow ( "direction", modal.createSelect ( "lat-direction", [
			{ "value": "N", "label": "North", "selected": true },
			{ "value": "S", "label": "South" }
		]))
	)
	var longitude = modal.createRows (
		modal.createRow ( "degrees", modal.createInput ( "text", "lon-degrees", "", "0" ) ),
		modal.createRow ( "minutes", modal.createInput ( "text", "lon-minutes", "", "0" ) ),
		modal.createRow ( "seconds", modal.createInput ( "text", "lon-seconds", "", "0" ) ),
		modal.createRow ( "direction", modal.createSelect ( "lon-direction", [
			{ "value": "W", "label": "West", "selected": true },
			{ "value": "E", "label": "East" }
		]))
	)
	var percision = modal.createRows (
		modal.createRow ( "horizontal precision", modal.createInput ( "text", "pre-horizontal", false, "0" ) ),
		modal.createRow ( "vertical precision", modal.createInput ( "text", "pre-vertical", false, "0" ) )
	)
	var altitude = modal.createInput ( "text", "altitude", false, "0" )
	var size = modal.createInput ( "text", "size", false, "0" )
	var matches = $(this).val ().match (/^IN LOC ([^ ]+) ([^ ]+) ([^ ]+) ([NS]) ([^ ]+) ([^ ]+) ([^ ]+) ([WE]) ([^ ]+)m ([^ ]+)m ([^ ]+)m ([^ ]+)m$/)
	if ( matches ) {
		$(latitude).find ("[name='lat-degrees']").val ( matches [ 1 ] )
		$(latitude).find ("[name='lat-minutes']").val ( matches [ 2 ] )
		$(latitude).find ("[name='lat-seconds']").val ( matches [ 3 ] )
		$(latitude).find ("[name='lat-direction']").val ( matches [ 4 ] )
		$(longitude).find ("[name='lon-degrees']").val ( matches [ 5 ] )
		$(longitude).find ("[name='lon-minutes']").val ( matches [ 6 ] )
		$(longitude).find ("[name='lon-seconds']").val ( matches [ 7 ] )
		$(longitude).find ("[name='lon-direction']").val ( matches [ 8 ] )
		$(altitude).val ( matches [ 9 ] )
		$(size).val ( matches [ 10 ] )
		$(percision).find ("[name='pre-horizontal']").val ( matches [ 11 ] )
		$(percision).find ("[name='pre-vertical']").val ( matches [ 12 ] )
	}
	confirm.addTitle ( "Add Record: LOC content", $(this).val () )
	confirm.addRow ( "Latitude", latitude, true )
	confirm.addRow ( "Longitude", longitude, true )
	confirm.addRow ( "Altitude (in meters)", altitude, true )
	confirm.addRow ( "Size (in meters)", size, true )
	confirm.addRow ( "Percision (in meters)", percision, true )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var latDegrees = $( components.container ).find ("[name='lat-degrees']").val ().trim ()
		var latMinutes = $( components.container ).find ("[name='lat-minutes']").val ().trim ()
		var latSeconds = $( components.container ).find ("[name='lat-seconds']").val ().trim ()
		var latDirection = $( components.container ).find ("[name='lat-direction']").val ()
		var lonDegrees = $( components.container ).find ("[name='lon-degrees']").val ().trim ()
		var lonMinutes = $( components.container ).find ("[name='lon-minutes']").val ().trim ()
		var lonSeconds = $( components.container ).find ("[name='lon-seconds']").val ().trim ()
		var lonDirection = $( components.container ).find ("[name='lon-direction']").val ()
		var altitude = $( components.container ).find ("[name='altitude']").val ().trim ()
		var size = $( components.container ).find ("[name='size']").val ().trim ()
		var preHorizontal = $( components.container ).find ("[name='pre-horizontal']").val ().trim ()
		var preVertical = $( components.container ).find ("[name='pre-vertical']").val ().trim ()
		let newValue = `IN LOC ${latDegrees} ${latMinutes} ${latSeconds} ${latDirection} ${lonDegrees} ${lonMinutes} ${lonSeconds} ${lonDirection} ${altitude}m ${size}m ${preHorizontal}m ${preVertical}m`
			.replace ( /(\d\.[0-9]*[1-9])0*|(\d)\.0+/g, "$1$2" )
		$(that).val ( newValue ).text ( newValue ).trigger ("change")
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-srv-name", function () {
	var that = this
	var confirm = new modal.Modal ()
	var service = modal.createInput ( "text", "service", "_sip" )
	var protocol = $("<select name='protocol' ><option value='_udp' >UDP</option><option value='_tcp' >TCP</option><option value='_tls' selected >TLS</option><select/>")
	var name = modal.createInput ( "text", "name", global.getDomainName (), global.getDomainName () )
	let oldValue = `${service.val ()}.${protocol.val ()}.${name.val ()}.`
	if ( $(that).hasClass ("editable") ) {
		oldValue = $(that).text ()
	}
	var matches = $(this).val ().match (/^([^.]+)\.([^.]+)\.(.+)\.$/)
	if ( matches ) {
		$(service).val ( matches [ 1 ] )
		$(protocol).val ( matches [ 2 ] )
		$(name).val ( matches [ 3 ] )
	}
	confirm.addTitle ( "Add Record: SRV name", $(this).val () )
	confirm.addRow ( "Service name", service )
	confirm.addRow ( "Protocol", protocol )
	confirm.addRow ( "Name", name )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var service = $( components.container ).find ("input[name='service']").val ().trim () || "_sip"
		var protocol = $( components.container ).find ("select[name='protocol']").val ().trim ()
		var name = $( components.container ).find ("input[name='name']").val ().trim () || global.getDomainName ()
		let newValue = `${service}.${protocol}.${name}.`
		$(that).val ( newValue ).text ( newValue )
		if ( $(that).hasClass ("editable") && oldValue != newValue ) {
			$(that).trigger ("change")
		}
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-srv", function () {
	var that = this
	var confirm = new modal.Modal ()
	var priority = modal.createInput ( "text", "priority", "1", "1" )
	var weight = modal.createInput ( "text", "weight", "10", "1" )
	var port = modal.createInput ( "text", "port", "8444", "1" )
	var target = modal.createInput ( "text", "target", "example.com", global.getDomainName () )
	var matches = $(this).val ().match (/^SRV ([^ ]+) ([^ ]+) ([^ ]+) (.+)\.$/)
	if ( matches ) {
		$(priority).val ( matches [ 1 ] )
		$(weight).val ( matches [ 2 ] )
		$(port).val ( matches [ 3 ] )
		$(target).val ( matches [ 4 ] )
	}
	let oldValue = $(that).val ()
	if ( $(that).hasClass ("editable") ) {
		oldValue = $(that).text ()
	}
	confirm.addTitle ( "Add Record: SRV content", $(this).val () )
	confirm.addRow ( "Priority", priority )
	confirm.addRow ( "Weight", weight )
	confirm.addRow ( "Port", port )
	confirm.addRow ( "Target", target )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var priority = $( components.container ).find ("input[name='priority']").val ().trim () || "1"
		var weight = $( components.container ).find ("input[name='weight']").val ().trim () || "1"
		var port = $( components.container ).find ("input[name='port']").val ().trim () || "1"
		var target = $( components.container ).find ("input[name='target']").val ().trim () || global.getDomainName ()
		let newValue = `SRV ${priority} ${weight} ${port} ${target}.`
		$(that).val ( newValue ).text ( newValue )
		if ( $(that).hasClass ("editable") && oldValue != newValue ) {
			$(that).trigger ("change")
		}
		else {
			$(document).find (".priority.add").val ( priority )
		}
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-spf", function () {
	var that = this
	var confirm = new modal.Modal ()
	var policy = modal.createTextarea ( "policy", "Policy parameters", $(this).val () )
	confirm.addTitle ( "Add Record: SPF content", $(this).val () )
	confirm.addRow ( "Content", policy, true )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var policy = $( components.container ).find ("[name='policy']").val ()
		$(that).val ( policy ).text ( policy ).trigger ("change")
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-txt", function () {
	var that = this
	var confirm = new modal.Modal ()
	var text = modal.createTextarea ( "text", "Text", $(this).val () )
	confirm.addTitle ( "Add Record: TXT content", $(this).val () )
	confirm.addRow ( "Content", text, true )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var text = $( components.container ).find ("[name='text']").val ()
		$(that).val ( text ).text ( text ).trigger ("change")
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "focus", ".show-form-caa", function () {
	var that = this
	var confirm = new modal.Modal ( true )
	var tag = modal.createSelect ( "tag", [
		{ label: "Only allow specific hostnames", value: "issue", selected: true },
		{ label: "Only allow wildcards", value: "issuewild" },
		{ label: "Send violation reports to URL (http:, https:, or mailto:)", value: "iodef" }
	])
	var value = modal.createInput ( "text", "value", "Certificate authority (CA) domain name" )
	let oldValue = $(that).hasClass (".editable") ? $(this).text () : $(this).val ()
	var matches = oldValue.match (/0 ((?:issue|issuewild|iodef)) \"(.+)\"/)
	if ( matches ) {
		$(tag).val ( matches [ 1 ] )
		$(value).val ( matches [ 2 ] )
	}
	confirm.addTitle ( "Add Record: CAA content", $(this).val () )
	confirm.addRow ( "Tag", tag )
	confirm.addRow ( "Value", value )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => {
		var tag = $( components.container ).find ("[name='tag']").val ().trim ()
		var value = $( components.container ).find ("[name='value']").val ().trim ()
		let newValue = `0 ${tag} "${value}"`
		$(that).val ( newValue ).text ( newValue ).trigger ("change")
		confirm.close ()
	}})
	confirm.show ()
})

$(document).on ( "cloudflare.dns.dns_records.page", function ( event, data ) {
	$(data.section).data ( "page", $(data.trigger).data ("page") )
	populateResult ( data.section )
})

$(document).on ( "cloudflare.dns.dns_records.next_page", function ( event, data ) {
	if ( $(data.section).data ("page") + 1 <= Math.ceil ( $(data.section).data ("item-count") / $(data.section).data ("page-size") ) ) {
		$(data.section).data ( "page", $(data.section).data ("page") + 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.dns.dns_records.previous_page", function ( event, data ) {
	if ( $(data.section).data ("page") - 1 > 0 ) {
		$(data.section).data ( "page", $(data.section).data ("page") - 1 )
		populateResult ( data.section )
	}
})

$(document).on ( "cloudflare.dns.dns_records.sort", function ( event, data ) {
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

$(document).on ( "cloudflare.dns.dns_records.export", function ( event, data ) {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key },
		success: function ( response ) {
			notification.showMessages ( response )
			let blob = new Blob ( [ response ], { type: "octet/stream" } )
			let url = window.URL.createObjectURL ( blob )
			let a = document.createElement ("a")
			document.body.appendChild ( a )
			a.style = "display: none"
			a.href = url
			a.download = global.getDomainName () + ".txt"
			a.click ()
			window.URL.revokeObjectURL ( url )
			$(data.section).removeClass ("loading")
		}
	})
})

$(document).on ( "cloudflare.dns.dns_records.upload", function ( event, data ) {
	let prompt = new modal.Modal ()
	let form = $(`<form method="POST" enctype="multipart/form-data" >`)
		.css ( "display", "none" )
	let fileInput = $("<input id='file_select' >")
		.prop ( "type", "file" )
		.prop ( "name", "file" )
	let submitInput = $("<input>")
		.prop ( "type", "submit" )
		.prop ( "name", "submit" )
		.css ({ "display": "none" })
	let fileButton = modal.createInput ( "button", "select", "", "Select a file" )
		.on ( "click", () => $(fileInput).trigger ("click") )
	let fileName = modal.createInput ( "text", "filename", "", "" )
		.prop ( "disabled", true )
		.css ( "margin-left", "10px" )
		.on ( "click", () => $(fileInput).trigger ("click") )
	$(fileInput).on ( "change", () => {
		let newVal = $(fileInput).val ().split ("\\").pop ()
		$(fileName).val ( newVal == null ? "" : newVal )
	})
	let messagesContainer = $("<div>").addClass ("message_container")
	$(form).append ( fileInput ).append ( submitInput )
		.on ( "submit", ( event ) => {
			event.preventDefault ()
			$(prompt.components.modal).addClass ("loading")
			let formData = new FormData ( form [ 0 ] )
			formData.set ( "form_key", data.form.key )
			formData.set ( "file", ($(fileInput)) [ 0 ].files [ 0 ] )
			$.ajax ({
				url: data.form.endpoint,
				type: "POST",
				data: formData,
				cache: false,
				contentType: false,
				processData: false,
				success: ( response ) => {
					notification.showMessages ( response )
					if ( response.success && response.result.recs_added == response.result.total_records_parsed ) {
						prompt.close ()
						$(data.section).addClass ("loading")
						common.loadSections (".dns.dns_records")
					}
					else if ( response.success ) {
						$(prompt.components.modal).removeClass ("loading")
						$(messagesContainer).html ( $("<div>")
							.text (`${response.result.recs_added} record(s) added`)
							.addClass ("status")
						)
						response.messages.map ( message => {
							$(messagesContainer).append ( $("<div>").text ( message.message ) )
						})
						if ( response.result.recs_added > 0 ) {
							common.loadSections (".dns.dns_records")
						}
					}
					else {
						$(prompt.components.modal).removeClass ("loading")
						prompt.close ()
					}
				}
			})
		})
	prompt.addTitle ("Upload DNS File")
	prompt.addElement ( $("<p>").text ("If you have a DNS file that is in the BIND format, you can upload it here and we will do our best to parse it so you don't have to retype it.") )
	prompt.addElement ( form )
	prompt.addElement ( $("<div>")
		.append ( fileButton )
		.append ( fileName )
		.css ({
			display: "flex",
			padding: "22.5px",
			background: "#F5F5F5",
			border: "solid 1px #DEDEDE"
		})
	)
	prompt.addElement ( messagesContainer )
	prompt.addButton ({ label: "Cancel", class: "gray", callback: prompt.close })
	prompt.addButton ({ label: "Upload", callback: () => $(form).trigger ("submit") })
	prompt.show ()
})

$(document).on ( "blur", ".editable", ( event ) => {
	let target = event.target
	let oldValue = $(target).data ("old")
	let newValue = $(target).text ()
	if ( oldValue !== newValue ) {
		$(target).trigger ( "change", { target } )
	}
})

$(document).on ( "change", ".editable, .proxied, td.ttl", ( event ) => {
	let target = event.target
	let oldValue = $(target).data ("old")
	let newValue = $(target).text ()
	if ( oldValue !== newValue || $(target).hasClass ("proxied") ) {
		$(target).data ( "old", newValue )
		let entry = $(event.target).closest ("tr")
		let id = $(entry).data ("entry").id
		let type = $(entry).data ("entry").type
		let name = $(entry).find ("td.name").text ()
		let content = $(entry).find ("td.value > .editable").text ()
		let ttl = $(entry).find (".ttl").data ("ttl")
		let proxied = $(entry).find (".proxied").length > 0 &&
					  $(entry).find (".proxied").prop ("src").indexOf ("proxied_on") >= 0
		let priority = $(entry).find (".value .priority").text () || 0
		let section = $(entry).closest ("section")
		let endpoint = $(section).data ("endpoint").replace ( /(cloudflare\/[^\/]+\/)(index)?(.*)$/, "$1edit$3" )
		let formKey = $(section).data ("form-key")
		$(section).addClass ("loading")
		$(section).find ("[contenteditable]").prop ( "contenteditable", false )
		$.ajax ({
			url: endpoint,
			type: "POST",
			data: {
				"form_key": formKey,
				"id": id,
				"type": type,
				"name": name,
				"content": content,
				"ttl": ttl,
				"proxied": proxied,
				"priority": priority == "" ? 0 : priority
			},
			success: ( response ) => {
				notification.showMessages ( response )
				$(section).find ("[contenteditable]").prop ( "contenteditable", true )
				common.loadSections (".dns.dns_records")
			}
		})
	}
})

$(document).on ( "click", ".cloudflare td.ttl", ( event ) => {
	if ( $(event.target).hasClass ("ttl") ) {
		let target = $(event.target)
		let entry = $(target).closest ("tr")
		let proxied = $(entry).find (".proxied")
		if ( proxied.length == 0 || $(proxied).eq ( 0 ).prop ("src").indexOf ("proxied_off") > -1 ) {
			let select = createTtlSelect ( $(target).data ("ttl") )
			$(select).on ( "change", () => {
				let value = $(select).val ()
				$(select).trigger ("blur")
				$(target).data ( "ttl", value )
				$(target).html ( secondsToAppropriate ( value ) )
				$(target).trigger ("change")
			})
			$(target).html ( select.focus () )
		}
	}
})
