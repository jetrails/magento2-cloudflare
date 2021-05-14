const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.enhanced_http2_prioritization.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.enhanced_http2_prioritization.toggle", switchElement.toggle )
