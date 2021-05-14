const $ = jQuery = jquery = require ("jquery")
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
				hasErrors = response => {
					if ( "code" in response && response.code == 1009 ) {
						return true
					}
					if ( "success" in response ) {
						return response.success === false
					}
					if ( "state" in response && "success" in response.state ) {
						return response.state.success === false
					}
					if ( "webp" in response && "success" in response.webp ) {
						return response.webp.success === false
					}
					return false
				}
				if ( hasErrors ( response ) ) {
					var header = "Authorization Error"
					var message = "It appears that the configured Cloudflare token does not have sufficient permissions to render this section."
					if ( response && response.errors && response.errors.some ( e => e.message.startsWith ("API Tokens are not supported") ) ) {
						header = "Unsupported Error"
						message = "Currently, this API endpoint cannot be used with token authorization. This may change in the future."
					}
					$(section).find (".row:nth-child( n + 2 )").remove ()
					$(section).find (".wrapper_bottom").remove ()
					$(section).find (".wrapper_right").remove ()
					$(section).find (".wrapper_left *:nth-child( n + 3 )").remove ()
					$(section).find (".row").append (`
						<div class="wrapper_right" >
							<div>
								<h5 class="error" >${header}</h5>
								<p>${message}</p>
							</div>
						</div>
					`)
					return
				}
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
