const notification = require ("cloudflare/core/notification")
const modal = require ("cloudflare/core/modal")
const common = require ("cloudflare/common")
const global = require ("cloudflare/global")

$(document).on ( "cloudflare.dns.custom_nameservers.initialize", function ( event, data ) {
	var table = $(data.section).find ("table.nameservers")
	var records = Object.keys ( data.response.result )
	$(table).find ("tbody > tr").remove ()
	$(table).hide ()
	$(data.section).find ("#action")
		.data ( "data", records )
		.val (`${ records.length > 0 ? "Edit" : "Add"} Custom Nameservers`)
	if ( records.length > 0 ) {
		$(table).show ()
		records.map ( record => {
			var nameserver = data.response.result [ record ]
			$(table).find ("tbody").append ( $("<tr>")
				.data ( "nameserver", nameserver )
				.append ( $("<td>").text ( record ) )
				.append ( $("<td>").text ( nameserver.ipv4 ) )
				.append ( $("<td>").text ( nameserver.ipv6 ) )
			)
		})
	}
})

$(document).on ( "cloudflare.dns.custom_nameservers.edit", function ( event, data ) {
	var records = $(data.trigger).data ("data") || []
	var section = data.section
	var confirm = new modal.Modal ( 800 )
	var yourSite = global.getDomainName ()
	confirm.addTitle ("Custom Nameservers")
	confirm.addRow (
		$(`<p>`).append ( $(`<strong>`).text ("Nameservers (Separate URLS by new line)") ),
		modal.createTextarea ( "nameservers", `Example: ns1.${yourSite}\nns2.${yourSite}`, records.join ("\n") ),
		true
	)
	var saveCallback = components => {
		$(components.modal).addClass ("loading")
		var nameservers = $(components.container).find ("[name='nameservers']").val ()
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: {
				"form_key": data.form.key,
				"nameservers": nameservers.split ("\n")
					.map ( e => e.trim () )
					.filter ( e => e.length > 0 )
			},
			success: function ( response ) {
				if ( response.success ) {
					confirm.close ()
					$(components.modal).removeClass ("loading")
					$(data.section).addClass ("loading")
					common.loadSections (".custom_nameservers")
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
