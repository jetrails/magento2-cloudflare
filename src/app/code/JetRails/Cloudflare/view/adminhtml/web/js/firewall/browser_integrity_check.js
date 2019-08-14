const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.browser_integrity_check.initialize", switchElement.initialize )
$(document).on ( "cloudflare.firewall.browser_integrity_check.toggle", switchElement.toggle )
