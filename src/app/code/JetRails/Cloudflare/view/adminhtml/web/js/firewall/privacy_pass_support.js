const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.privacy_pass_support.initialize", switchElement.initialize )
$(document).on ( "cloudflare.firewall.privacy_pass_support.toggle", switchElement.toggle )
