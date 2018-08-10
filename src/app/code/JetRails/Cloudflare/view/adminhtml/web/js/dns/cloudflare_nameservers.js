const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")

$(document).on ( "cloudflare.dns.cloudflare_nameservers.initialize", function ( event, data ) {
	$(data.section).find ("table tr:not(:first)").remove ()
	data.response.result.map ( entry => {
		var row = $("<tr>")
		$( row ).append ( $("<td>")
			.attr ( "class", "type_cfns" )
			.text ( "NS" )
		)
		$( row ).append ( $("<td>").text ( entry ) )
		$(data.section).find ("table").append ( row )
	})
})
