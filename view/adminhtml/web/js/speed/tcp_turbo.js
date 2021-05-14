const $ = jQuery = jquery = require ("jquery")

$(document).on ( "cloudflare.speed.tcp_turbo.initialize", ( event, data ) => {
	const plan = data.response.result
	$(data.section).find (".value").text ( plan === "free" ? "Disabled" : "Enabled" )
})
