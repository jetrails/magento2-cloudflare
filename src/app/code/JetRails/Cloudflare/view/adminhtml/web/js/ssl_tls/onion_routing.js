const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.ssl_tls.onion_routing.initialize", switchElement.initialize )
$(document).on ( "cloudflare.ssl_tls.onion_routing.toggle", switchElement.toggle )
