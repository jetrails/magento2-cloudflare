const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.speed.brotli.initialize", switchElement.initialize )
$(document).on ( "cloudflare.speed.brotli.toggle", switchElement.toggle )
