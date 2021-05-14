const $ = jQuery = jquery = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.ipv6_compatibility.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.ipv6_compatibility.toggle", switchElement.toggle )
