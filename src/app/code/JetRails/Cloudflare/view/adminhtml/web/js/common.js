const $ = require ("jquery")
const notification = require ("cloudflare/core/notification")

function loadSections ( additional = "" ) {
	$("section.cloudflare.initialize" + additional ).each ( ( index, section ) => {
		$.ajax ({
			url: $( section ).data ("endpoint"),
			type: "POST",
			data: {
				form_key: $( section ).data ("form-key")
			},
			success: ( response ) => {
				$(section).removeClass ("loading")
				notification.showMessages ( response )
				var event = {
					"target": {
						"tab": $( section ).data ("tab-name"),
						"section": $( section ).data ("section-name"),
						"action": "initialize"
					},
					"section": section,
					"response": response
				}
				event.target.name = [
					"cloudflare",
					event.target.tab,
					event.target.section,
					event.target.action
				].join (".")
				$.event.trigger ( event.target.name, event )
				// console.log ( "Triggered: " + event.target.name )
			}
		})
	})
}

module.exports = {
	loadSections: loadSections
}
