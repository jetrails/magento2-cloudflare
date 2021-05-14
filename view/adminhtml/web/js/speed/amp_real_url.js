const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.amp_real_url.initialize", switchElement.initializeCustom ( "enabled", true ) )
$(document).on ( "cloudflare.speed.amp_real_url.toggle", switchElement.toggle )
