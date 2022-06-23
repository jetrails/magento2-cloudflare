const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.http_2_to_origin.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.http_2_to_origin.toggle", switchElement.toggle )
