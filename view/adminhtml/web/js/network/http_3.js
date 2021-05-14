const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.http_3.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.http_3.toggle", switchElement.toggle )
