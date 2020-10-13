const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.onion_routing.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.onion_routing.toggle", switchElement.toggle )
