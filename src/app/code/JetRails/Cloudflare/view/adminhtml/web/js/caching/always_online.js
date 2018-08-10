const $ = require ("jquery")
const switchElement = require ("cloudflare/generic/switch")

$(document).on ( "cloudflare.caching.always_online.initialize", switchElement.initialize )
$(document).on ( "cloudflare.caching.always_online.toggle", switchElement.toggle )
