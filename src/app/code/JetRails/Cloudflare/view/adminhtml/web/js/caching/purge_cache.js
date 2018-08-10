const $ = require ("jquery")
const modal = require ("cloudflare/core/modal")
const notification = require ("cloudflare/core/notification")

$(document).on ( "cloudflare.caching.purge_cache.individual", ( event, data ) => {
	let textarea = modal
		.createTextarea ( "files", "http://example.com/images/example.jpg" )
		.css ({
			"width": "calc(100% - 45px)",
			"margin": "auto 22.5px",
			"fontSize": "1.2em"
		})
	let prompt = new modal.Modal ( 800 )
	prompt.addTitle ( "Purge Individual Files", "You can purge up to 30 files at a time." )
	prompt.addElement ( $("<p>")
		.append ( $("<strong>").text ("Note: ") )
		.append ("Wildcards are not supported with single file purge at this time. You will need to specify the full path to the file.")
	)
	prompt.addElement ( $("<p>").text ("Separate tags(s) with commas, or list one per line") )
	prompt.addElement ( textarea )
	prompt.addButton ({ label: "Purge Individual Files", callback: ( components ) => {
		$(prompt.components.modal).addClass ("loading")
		$(data.section).addClass ("loading")
		let files = $(textarea).val ()
			.split (/\n|,/)
			.map ( i => i.trim () )
			.filter ( i => i !== "" )
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key, "files": files },
			success: ( response ) => {
				if ( response.success ) {
					prompt.close ()
				}
				else {
					$(prompt.components.modal).removeClass ("loading")
				}
				notification.showMessages ( response )
				$(data.section).removeClass ("loading")
			}
		})
	}})
	prompt.show ()
})

$(document).on ( "cloudflare.caching.purge_cache.everything", ( event, data ) => {
	$(data.section).addClass ("loading")
	$.ajax ({
		url: data.form.endpoint,
		type: "POST",
		data: { "form_key": data.form.key },
		success: ( response ) => {
			notification.showMessages ( response )
			$(data.section).removeClass ("loading")
		}
	})
})
