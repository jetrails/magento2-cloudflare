const $ = require ("jquery")
const selectElement = require ("cloudflare/generic/select")

$(document).on ( "cloudflare.firewall.security_level.initialize", selectElement.initialize )
$(document).on ( "cloudflare.firewall.security_level.update", selectElement.update )
