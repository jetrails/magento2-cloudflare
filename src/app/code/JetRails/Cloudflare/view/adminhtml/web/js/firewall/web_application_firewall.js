const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.web_application_firewall.initialize", switchElement.initialize )
$(document).on ( "cloudflare.firewall.web_application_firewall.toggle", switchElement.toggle )
