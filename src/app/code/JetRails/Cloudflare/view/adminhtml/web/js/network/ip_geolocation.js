const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.network.ip_geolocation.initialize", switchElement.initialize )
$(document).on ( "cloudflare.network.ip_geolocation.toggle", switchElement.toggle )
