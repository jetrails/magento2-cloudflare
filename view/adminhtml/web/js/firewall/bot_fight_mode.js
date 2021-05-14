const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.firewall.bot_fight_mode.initialize", switchElement.initializeCustom ( "fight_mode", true ) )
$(document).on ( "cloudflare.firewall.bot_fight_mode.toggle", switchElement.toggle )
