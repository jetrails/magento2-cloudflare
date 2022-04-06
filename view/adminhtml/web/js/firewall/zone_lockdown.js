const $ = jQuery = jquery = require ("jquery")
const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")
const common = require ("cloudflare/common")
const global = require ("cloudflare/global")

$(document).on ( "cloudflare.firewall.zone_lockdown.initialize", function ( event, data ) {
	let rulesUsed = data.response.result.filter ( e => !e.paused ).length
	let rulesAllowed = data.response.entitlements.allocation.value
	$(data.section).find ("#rules_total").text ( rulesAllowed )
	$(data.section).find ("#rules_used").text ( rulesUsed )
	if ( rulesUsed < rulesAllowed ) {
		$(data.section).find ("#action")
			.addClass ("trigger")
			.val ("Create Lockdown Rule")
			.off ( "click" )
	}
	else {
		$(data.section).find ("#action")
			.removeClass ("trigger")
			.val ("Buy More Zone Lockdown Rules")
			.on ( "click", () => {
				window.open ( "https://www.cloudflare.com/plans/", "_blank" )
			})
	}
	var table = $(data.section).find ("table.rules")
	$(table).find ("tbody > tr").remove ()
	$(data.section).data ( "rules", data.response.result )
	if ( data.response.result.length > 0 ) {
		data.response.result
		.sort ( ( a, b ) => {
			return a.priority - b.priority
		})
		.map ( rule => {
			$(table).find ("tbody").append ( $("<tr>")
				.data ( "rule", rule )
				.append (
					$("<td class='no_white_space' >")
						.html (`<b>${rule.description}</b>`)
						.append ( $("<span>").html (
							[
								rule.urls.length > 0 ? `${rule.urls.length} URLs` : null,
								rule.configurations.length > 0 ? `${rule.configurations.length} IP Addresses` : null,
								rule.priority ? `<br/>Priority: ${rule.priority}` : null,
							].filter ( e => e ).join (", ")
						))
				)
				.append ( $("<td>")
					.append (( () => {
						var element = modal.createSwitch ( "status", !rule.paused )
						$(element).find ("input")
							.addClass ("trigger")
							.data ( "target", "toggle" )
							.data ( "rule", rule )
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
							.data ( "description", rule.description )
							.css ( "display", "inline-block" )
					)
				)
			)
		})
	}
	else {
		$(table).find ("tbody").append (
			$("<tr>").append (
				$("<td colspan='6' >").text ("You currently have no Zone Lockdown Rules. To create some click on the button above.")
			)
		)
	}
})

$(document).on ( "cloudflare.firewall.zone_lockdown.toggle", function ( event, data ) {
	var rule = data.trigger.data ("rule")
	var enabled = $(data.trigger).is (":checked")
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint.replace ( "toggle", "edit" ),
		type: "POST",
		data: {
			"form_key": data.form.key,
			"id": rule.id,
			"description": rule.description,
			"paused": !enabled,
			"configurations": rule.configurations,
			"urls": rule.urls,
			"priority": rule.priority
		},
		success: function ( response ) {
			$(data.section).removeClass ("loading")
			notification.showMessages ( response )
		}
	})
})

$(document).on ( "cloudflare.firewall.zone_lockdown.delete", function ( event, data ) {
	var confirm = new modal.Modal ( 800 )
	confirm.addTitle ("Delete Zone Lockdown Rule")
	confirm.addElement ( $("<p>").html (`Please confirm that you would like to delete the following rule: <b>${data.trigger.data ("description")}</b>`) )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Delete Zone Lockdown Rule", class: "red", callback: ( components ) => {
		confirm.close ()
		var id = data.trigger.data ("id")
		$(data.section).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "id": id },
			success: function ( response ) {
				notification.showMessages ( response )
				common.loadSections (".zone_lockdown")
			}
		})
	}})
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.zone_lockdown.edit", function ( event, data ) {
	var response = $(data.trigger).data ("data")
	var section = data.section
	var confirm = new modal.Modal ( 800 )
	var collections = $(`<div class="collections" >`)
	var yourSite = global.getDomainName ()
	var paused = response.paused
	var id = response.id
	confirm.addTitle ("Edit a Zone Lockdown Rule")
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Name") ),
		modal.createInput ( "text", "description", "Example: Allow traffic from Office IP address", response.description ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("URLs (Separate URLS by new line)") ),
		modal.createTextarea ( "urls", `Example: www.${yourSite}/login\nwww.${yourSite}`, response.urls.join ("\n") ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("IP Range (Separate IP Addresses by new line)") ),
		modal.createTextarea ( "configurations", `Example: 1.1.1.0/28\n1.1.1.0/12`, response.configurations.map ( e => e.value ).join ("\n") ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Priority") ),
		modal.createInput ( "number", "priority", "", response.priority ),
		true
	)
	var saveCallback = components => {
		$(components.modal).addClass ("loading")
		var target = $(components.container).find ("[name='description']").val ()
		var urls = $(components.container).find ("[name='urls']").val ()
		var configurations = $(components.container).find ("[name='configurations']").val ()
		var priority = $(components.container).find ("[name='priority']").val ()
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"id": id,
				"description": target,
				"paused": paused,
				"configurations": configurations.split ("\n")
					.map ( e => e.trim () )
					.filter ( e => !!e )
					.map ( e => {
						return {
							target: /\//.test ( e ) ? "ip_range" : "ip",
							value: e.trim (),
						}
					}),
				"urls": urls.split ("\n")
					.map ( e => e.trim () )
					.filter ( e => e.length > 0 ),
				"priority": priority
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".zone_lockdown")
				}
				else {
					$(components.modal).removeClass ("loading")
					notification.showMessages ( response )
				}
			}
		})
	}
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Save", callback: ( components ) => { saveCallback ( components ) } })
	confirm.show ()
})

$(document).on ( "cloudflare.firewall.zone_lockdown.create", function ( event, data ) {
	var section = data.section
	var confirm = new modal.Modal ( 800 )
	var collections = $(`<div class="collections" >`)
	var yourSite = global.getDomainName ()
	confirm.addTitle ("Create a Zone Lockdown Rule")
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Name") ),
		modal.createInput ( "text", "description", "Example: Allow traffic from Office IP address" ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("URLs (Separate URLS by new line)") ),
		modal.createTextarea ( "urls", `Example: www.${yourSite}/login\nwww.${yourSite}` ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("IP Range (Separate IP Addresses by new line)") ),
		modal.createTextarea ( "configurations", `Example: 1.1.1.0/28\n1.1.1.0/12` ),
		true
	)
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Priority") ),
		modal.createInput ( "number", "priority", "" ),
		true
	)
	var saveCallback = ( components, status ) => {
		$(components.modal).addClass ("loading")
		var target = $(components.container).find ("[name='description']").val ()
		var urls = $(components.container).find ("[name='urls']").val ()
		var configurations = $(components.container).find ("[name='configurations']").val ()
		var priority = $(components.container).find ("[name='priority']").val ()
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"description": target,
				"paused": status,
				"configurations": configurations.split ("\n")
					.map ( e => e.trim () )
					.filter ( e => !!e )
					.map ( e => {
						return {
							target: /\//.test ( e ) ? "ip_range" : "ip",
							value: e.trim (),
						}
					}),
				"urls": urls.split ("\n")
					.map ( e => e.trim () )
					.filter ( e => e.length > 0 ),
				"priority": priority
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".zone_lockdown")
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
	confirm.addButton ({ label: "Save and Deploy", callback: ( components ) => { saveCallback ( components, false ) } })
	confirm.show ()
})

export default (window.$ = window.jQuery = $)
