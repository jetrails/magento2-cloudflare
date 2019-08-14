const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.true_client_ip_header.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.true_client_ip_header.toggle", switchElement.toggle )
