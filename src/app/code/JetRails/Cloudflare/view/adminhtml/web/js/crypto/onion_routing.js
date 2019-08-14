const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.crypto.onion_routing.initialize", switchElement.initialize )
$(document).on ( "cloudflare.crypto.onion_routing.toggle", switchElement.toggle )
