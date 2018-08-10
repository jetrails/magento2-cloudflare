const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.http_2.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.http_2.toggle", switchElement.toggle )
