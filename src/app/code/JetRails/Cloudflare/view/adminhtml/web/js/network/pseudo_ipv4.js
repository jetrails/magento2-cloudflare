const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.network.pseudo_ipv4.initialize", selectElement.initialize )
$(document).on ( "cloudflare.network.pseudo_ipv4.update", selectElement.update )
