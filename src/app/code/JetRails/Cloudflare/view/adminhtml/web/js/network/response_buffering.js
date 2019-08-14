const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.response_buffering.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.response_buffering.toggle", switchElement.toggle )
