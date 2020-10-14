const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.dns.cname_flattening.initialize", selectElement.initialize )
$(document).on ( "cloudflare.dns.cname_flattening.update", selectElement.update )
