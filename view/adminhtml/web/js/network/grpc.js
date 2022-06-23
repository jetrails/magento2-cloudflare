const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.grpc.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.grpc.toggle", switchElement.toggle )
