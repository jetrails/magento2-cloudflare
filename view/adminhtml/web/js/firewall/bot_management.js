const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.bot_management.initialize", switchElement.initializeCustom ( "enabled", true ) )
$(document).on ( "cloudflare.firewall.bot_management.toggle", switchElement.toggle )
