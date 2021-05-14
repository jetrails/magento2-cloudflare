const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.zero_rtt_connection_resumption.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.zero_rtt_connection_resumption.toggle", switchElement.toggle )
