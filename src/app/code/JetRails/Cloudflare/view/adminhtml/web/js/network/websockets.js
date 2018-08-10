const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.websockets.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.websockets.toggle", switchElement.toggle )
