const $ = jQuery = jquery = require ("jquery")
const modal = require ("cloudflare/core/modal")
const notification = require ("cloudflare/core/notification")
const global = require ("cloudflare/global")

$(document).on ( "cloudflare.caching.purge_cache.custom", ( event, data ) => {
	const yourSite = global.getDomainName ()
	let prompt = new modal.Modal ( 800 )
	let choosen = null
	const createRow = ( value, description ) => {
		const onClick = () => {
			choosen = value
			$(`p.purge_cache-container div`).css ({ display: "none" })
			$(`p.purge_cache-container div[data-type="${value}"]`).css ({ display: "block" })
			$(".cloudflare_modal .buttons .purge").css ({ display: "block" })
		}
		return $("<tr>")
			.append ( $("<td>").css ({ verticalAlign: "top" })
				.append (
					$("<input>")
						.attr ( "type", "radio" )
						.attr ( "name", "type" )
						.attr ( "value", value )
						.attr ( "id", `purge_type-${value}` )
						.on ( "click", onClick )
				)
			)
			.append ( $("<td>")
				.append (
					$(`<label for='purge_type-${value}' >`)
						.css ({ minHeight: 60, display: "block", fontSize: "1.05em" })
						.html ( description )
						.on ( "click", onClick )
				)
			)
	}
	prompt.addTitle ( "Custom Purge" )
	prompt.addElement ( $("<p>").css ({ paddingBottom: 0 })
		.append ( $("<strong>").text ("Purge by:") )
		.append ( $("<table>").css ({ marginTop: 15 })
			.append ( createRow ( "url", "<b>URL:</b> Any assets in the Cloudflare cache that match the URL(s) exactly will be purged from the cache." ))
			.append ( createRow ( "hostname", "<b>Hostname:</b> Any assets at URLs with a host that matches one of the provided values will be purged from the cache. (Enterprise only)" ))
			.append ( createRow ( "tag", "<b>Tag:</b> Any assets served with a Cache-tag response header that matches one of the provided values will be purged from the cache. (Enterprise only)" ))
			.append ( createRow ( "prefix", "<b>Prefix:</b> Any assets in the directory will be purged from cache. (Enterprise only)" ))
		)
	)
	prompt.addElement ( $("<p>").addClass ("purge_cache-container")
		.append ( $("<div>")
			.attr ("data-type", "url")
			.css ({ display: "none" })
			.append ( $("<p>").text ("You will need to specify the full path to the file. Wildcards are not supported with single URL purge at this time. You can purge up to 30 URLs at a time.") )
			.append ( $("<p>").text ("Separate URL(s) one per line.") )
			.append ( modal.createTextarea ( "urls", `Example:\nhttps://www.${yourSite}\nhttps://www.${yourSite}/cat.jpg` ) )
		)
		.append ( $("<div>")
			.attr ("data-type", "hostname")
			.css ({ display: "none" })
			.append ( $("<p>").text ("You can purge up to 30 hostnames at a time.") )
			.append ( $("<p>").text ("Separate hostnames(s) with commas, or one per line.") )
			.append ( modal.createTextarea ( "hostnames", `Example:\nwww.${yourSite}, blog.${yourSite}, shop.${yourSite}, foo.bar.${yourSite}` ) )
		)
		.append ( $("<div>")
			.attr ("data-type", "tag")
			.css ({ display: "none" })
			.append ( $("<p>").text ("You can purge up to 30 tags at a time.") )
			.append ( $("<p>").text ("Separate tag(s) with commas, or one per line.") )
			.append ( modal.createTextarea ( "tags", `Example:\ndog, cat, foobar` ) )
		)
		.append ( $("<div>")
			.attr ("data-type", "prefix")
			.css ({ display: "none" })
			.append ( $("<p>").text ("You can purge up to 30 prefixes at a time.") )
			.append ( $("<p>").text ("Separate prefix(s) one per line.") )
			.append ( modal.createTextarea ( "prefixes", `Example:\nwww.${yourSite}/foo\nwww.${yourSite}/foo/bar\nwww.${yourSite}/foo/bar/baz` ) )
		)
	)
	prompt.addButton ({ label: "Cancel", class: "gray", callback: prompt.close })
	prompt.addButton ({ label: "Purge", class: "purge", callback: ( components ) => {
		if ( choosen ) {
			$(prompt.components.modal).addClass ("loading")
			$(data.section).addClass ("loading")
			let items = $(`.purge_cache-container div[data-type="${choosen}"] textarea`).val ()
				.split ( [ "prefix", "url" ].includes ( choosen ) ? /\s+/ : /[\s,]+/ )
				.map ( i => i.trim () )
				.filter ( i => i !== "" )
			$.ajax ({
				url: data.form.endpoint.replace ( "custom", choosen ),
				type: "POST",
				data: { "form_key": data.form.key, items },
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
		}
	}})
	prompt.show ()
	$(".cloudflare_modal .buttons .purge").css ({ display: "none" })
})

$(document).on ( "cloudflare.caching.purge_cache.everything", ( event, data ) => {
	let confirm = new modal.Modal ()
	confirm.addTitle ( "Confirm purge everything" )
	confirm.addElement ( $("<p>").append ("Purge all cached files. Purging your cache may slow your website temporarily.") )
	confirm.addButton ({ label: "Cancel", class: "gray", callback: confirm.close })
	confirm.addButton ({ label: "Purge Everything", class: "red", callback: ( components ) => {
		$(confirm.components.modal).addClass ("loading")
		$(data.section).addClass ("loading")
		$.ajax ({
			url: data.form.endpoint,
			type: "POST",
			data: { "form_key": data.form.key },
			success: ( response ) => {
				if ( response.success ) {
					confirm.close ()
				}
				else {
					$(confirm.components.modal).removeClass ("loading")
				}
				notification.showMessages ( response )
				$(data.section).removeClass ("loading")
			}
		})
	}})
	confirm.show ()
})
